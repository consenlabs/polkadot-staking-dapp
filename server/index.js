const express = require('express');
const bodyParser = require('body-parser')
const Api = require('@polkadot/api')
const Provider = require('@polkadot/rpc-provider')
const helper = require('./helper')

// const path = require('path');
const endpoints = {
  polkadot: 'wss://polkadot-mainnet.token.im/ws',
  kusama: 'wss://kusama-mainnet.token.im/ws',
}

let polkadot_vs = []
let kusama_vs = []
let apiMap = {
  kusama: null,
  polkadot: null,
}

function initClient(key) {
  if (!apiMap[key]) {
    const provider = new Provider.WsProvider(endpoints[key])
    apiMap[key] = new Api.ApiPromise({ provider })

    apiMap[key].rpc.chain.subscribeNewHeads(async (header) => {
      console.log(`Chain is at #${header.number}`)
    }).catch(console.error);
  }
  fetchValidators(key)
}

function fetchValidators(key) {
  let _api = apiMap[key]

  if (_api) {
    _api.isReady.then(async () => {
      const era = await _api.derive.session.indexes()
      const lastEra = era.activeEra.gtn(0) ? era.activeEra.subn(1) : helper.BN_ZERO
      const validatorReward = await _api.query.staking.erasValidatorReward(lastEra)

      const points = await _api.derive.staking.currentPoints()
      const pointsDict = {}
      // console.log(points)
      points.individual.forEach((value, key) => {
        pointsDict[key.toString()] = value.toString()
      })

      // get validators
      Promise.all([_api.derive.staking.electedInfo(), _api.derive.staking.waitingInfo()]).then(async (results) => {
        console.log('# fetching validators')
        const result = helper.extractInfo(results[0], results[1], validatorReward.unwrapOrDefault())
        const validators = result.validators.map((t) => helper.normalizeValidator(t, pointsDict))
        const all = (validators || []).map((t) => {
          return _api.derive.accounts.info(t.accountId.toString())
        })
        // get validators account info
        Promise.all(all).then((identitis) => {
          console.log('# fetching identitis')
          if (key === 'kusama') {
            kusama_vs = helper.mergeValidatorDisplayName(validators, identitis)
          } else {
            polkadot_vs = helper.mergeValidatorDisplayName(validators, identitis)
          }
        }).catch(console.error)
      }).catch(console.error)
    })
  }
}

initClient('kusama')
initClient('polkadot')

setInterval(() => {
  initClient('kusama')
  initClient('polkadot')
}, 1000 * 60 * 2);

const app = express();
app.use(bodyParser.json())


app.get('/api/polkadot/validators', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  return res.send(polkadot_vs);
});

app.get('/api/kusama/validators', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  return res.send(kusama_vs);
});

app.listen(process.env.PORT || 8080);