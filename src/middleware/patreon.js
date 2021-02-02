const axios = require("axios");
const fs = require("fs");
const path = require("path");
const util = require("util");
const readFile = util.promisify(fs.readFile);
let patreon = require("../../config/patreon.json");

const formUrlEncoded = (x) =>
  Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, "");

module.exports.verifyPatreon = function (app) {
  return async function (req, res, next) {
    if (!req.user)
      return res.status(500).json({ error: true, message: "No user" });

    const user = req.user;

    if (!user.patreon)
      return res
        .status(500)
        .json({ error: true, message: "User is not connected with Patreon" });

    //check if creator token is still valid.
    let isValid = await checkCreatorToken();
    if (!isValid) await refreshCreatorToken();

    isValid = await checkUserToken(user.patreon.access_token);
    if (!isValid) {
      console.info("User token is expired");
      const tokens = await refreshUserToken(user.patreon.refresh_token);
      if (!tokens)
        return res
          .status(500)
          .json({ error: true, message: "Server encountered an error" });
      user.patreon.access_token = tokens.access_token;
      user.patreon.refresh_token = tokens.refresh_token;
      app
        .service("users")
        .patch(user.id, {
          patreon: user.patreon,
        })
        .then(() => {
          console.info("Refreshed User Token");
        })
        .catch((e) => {
          console.error("db error: saving patreon tokens");
        });
    }

    const membership_id = await getMembershipId(user.patreon.access_token);

    if (!membership_id)
      return res
        .status(404)
        .json({ error: true, message: "You are not a patron" });

    const patronData = await getPatronData(membership_id);

    if (!patronData)
      return res
        .status(404)
        .json({ error: true, message: "You are not a patron" });

    if (!patronData.data.relationships.currently_entitled_tiers)
      return res.status(404).json({ error: true, message: "No patron tier." });
    if (
      patronData.data.relationships.currently_entitled_tiers.data.length === 0
    )
      return res.status(404).json({ error: true, message: "No patron tier." });

    //get tier id then get tier data?
    const tier_id =
      patronData.data.relationships.currently_entitled_tiers.data[0].id;

    const tiers = await getTiers();

    if (!tiers)
      return res
        .status(500)
        .json({ error: true, message: "Server encountered an error" });

    let userTier;
    for (let tier of tiers) {
      if (tier_id === tier.id) {
        userTier = tier;
        break;
      }
    }

    let newTier,
      tierName = userTier.attributes.title;

    if (userTier.attributes.amount_cents === 100) {
      newTier = 0;
    } else if (userTier.attributes.amount_cents === 500) {
      newTier = 1;
    } else if (userTier.attributes.amount_cents === 1000) {
      newTier = 2;
    } else if (userTier.attributes.amount_cents === 1500) {
      newTier = 3;
    } else if (userTier.attributes.amount_cents === 3000) {
      newTier = 4;
    }

    //don't update if patron and same tier
    if (user.patreon.isPatron && user.patreon.tier === newTier)
      return res.json({ error: true, message: "You are a patron already!" });

    user.patreon.isPatron = true;
    user.patreon.tier = newTier;
    user.patreon.tierName = tierName;

    app
      .service("users")
      .patch(user.id, {
        patreon: user.patreon,
      })
      .then(() => {
        console.info(
          `Updated ${user.username} with patreon: ${user.patreon.isPatron} | tier: ${user.patreon.tierName}`
        );
        return res.json({
          error: false,
          message: "Updated Patreon Status",
        });
      })
      .catch((e) => {
        console.error(`db error while saving patron status for ${user.id}`);
        return res.json({
          error: true,
          message: "An error occurred while linking your account!",
        });
      });
  };
};

const getTiers = async () => {
  patreon = await readFile(
    path.resolve(__dirname, "../../config/patreon.json"),
    "utf8"
  )
    .then((data) => {
      return JSON.parse(data);
    })
    .catch((e) => {
      console.error(e);
      return null;
    });
  let tiers;
  await axios
    .get(
      `https://www.patreon.com/api/oauth2/v2/campaigns/${patreon.campaignID}?include=tiers&fields%5Btier%5D=amount_cents,title`,
      {
        headers: {
          Authorization: `Bearer ${patreon.CREATOR_ACCESS_TOKEN}`,
        },
      }
    )
    .then((response) => {
      if (!response.data.included) return;
      tiers = response.data.included;
    })
    .catch((e) => {
      if (!e.response) return console.error(e);
      console.log(e.response.data);
      if (e.response.data.errors[0].code !== 4) {
        return console.error(e.response.data);
      }
    });
  return tiers;
};

const checkUserToken = async (access_token) => {
  let isValid;
  await axios
    .get(`https://www.patreon.com/api/oauth2/v2/identity?include=memberships`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
    .then((response) => {
      if (response.status < 400) {
        isValid = true;
      }
    })
    .catch(async (e) => {
      if (!e.response) return console.error(e);
      if (e.response.status === 401) {
        return;
      }
      console.error(e.response.data);
    });
  return isValid;
};

const getMembershipId = async (access_token) => {
  let membership_id;
  await axios
    .get(
      `https://www.patreon.com/api/oauth2/v2/identity?include=memberships,memberships.campaign`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    )
    .then((response) => {
      if (
        !response.data.included &&
        typeof response.data.included[Symbol.iterator] !== "function"
      )
        return;
      for (const included of response.data.included) {
        if (!included.relationships) break;
        if (patreon.campaignID === included.relationships.campaign.data.id) {
          membership_id = included.id;
          break;
        }
      }
    })
    .catch(async (e) => {
      if (!e.response) return console.error(e);
      if (e.response.data.errors[0].code !== 4) {
        console.error(e.response.data);
      }
    });
  return membership_id;
};

const refreshUserToken = async (refresh_token) => {
  let tokens;
  await axios(`https://www.patreon.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: formUrlEncoded({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
      client_id: patreon.CLIENT_ID,
      client_secret: patreon.CLIENT_SECRET,
    }),
  })
    .then((response) => {
      const data = response.data;
      tokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      };
    })
    .catch((e) => {
      if (!e.response) return console.error(e);
      console.error(e.response.data);
    });
  return tokens;
};

const getPatronData = async (patronId) => {
  patreon = await readFile(
    path.resolve(__dirname, "../../config/patreon.json"),
    "utf8"
  )
    .then((data) => {
      return JSON.parse(data);
    })
    .catch((e) => {
      console.error(e);
      return null;
    });
  let patronData;
  await axios
    .get(
      `https://www.patreon.com/api/oauth2/v2/members/${patronId}?include=currently_entitled_tiers,user&fields%5Bmember%5D=patron_status,email,pledge_relationship_start,campaign_lifetime_support_cents,currently_entitled_amount_cents,last_charge_date,last_charge_status,will_pay_amount_cents`,
      {
        headers: {
          Authorization: `Bearer ${patreon.CREATOR_ACCESS_TOKEN}`,
        },
      }
    )
    .then((response) => {
      patronData = response.data;
    })
    .catch((e) => {
      if (!e.response) return console.error(e);
      console.log(e.response.data);
      if (e.response.data.errors[0].code !== 4) {
        return console.error(e.response.data);
      }
    });
  return patronData;
};

const refreshCreatorToken = async () => {
  patreon = await readFile(
    path.resolve(__dirname, "../../config/patreon.json"),
    "utf8"
  )
    .then((data) => {
      return JSON.parse(data);
    })
    .catch((e) => {
      console.error(e);
      return null;
    });
  await axios(`https://www.patreon.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: formUrlEncoded({
      grant_type: "refresh_token",
      refresh_token: patreon.CREATOR_REFRESH_TOKEN,
      client_id: patreon.CLIENT_ID,
      client_secret: patreon.CLIENT_SECRET,
    }),
  })
    .then((response) => {
      const data = response.data;
      patreon.CREATOR_ACCESS_TOKEN = data.access_token;
      patreon.CREATOR_REFRESH_TOKEN = data.refresh_token;
      fs.writeFile(
        path.resolve(__dirname, "../../config/patreon.json"),
        JSON.stringify(patreon, null, 4),
        (err) => {
          if (err) return console.error(err);
          console.log("Refreshed Creator Patreon Token");
        }
      );
    })
    .catch((e) => {
      if (!e.response) return console.error(e);
      console.error(e.response.data);
    });
};

const checkCreatorToken = async () => {
  patreon = await readFile(
    path.resolve(__dirname, "../../config/patreon.json"),
    "utf8"
  )
    .then((data) => {
      return JSON.parse(data);
    })
    .catch((e) => {
      console.error(e);
      return null;
    });
  let isValid;
  await axios
    .get(`https://www.patreon.com/api/oauth2/v2/campaigns`, {
      headers: {
        Authorization: `Bearer ${patreon.CREATOR_ACCESS_TOKEN}`,
      },
    })
    .then((response) => {
      if (response.status < 400) {
        isValid = true;
      }
    })
    .catch((e) => {
      if (!e.response) return console.error(e);
      if (e.response.status === 401) {
        return console.error("Creator Patreon token has expired...");
      }
      console.error(e.response.data);
    });
  return isValid;
};

module.exports.deletePatreon = function (app) {
  return async function (req, res, next) {
    const user = req.user;
    const users = app.service("users");

    users
      .patch(user.id, {
        patreon: null,
      })
      .then(() => {
        return res.json({
          error: false,
          errorMsg: "",
        });
      })
      .catch((e) => {
        console.error(e);
        return res.json({
          error: true,
          errorMsg: "something went wrong with users service",
        });
      });
  };
};
