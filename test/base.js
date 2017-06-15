import test from 'ava'
import { Action } from '../'
import user from './actions/user'

test('isLogin', async t => {
  let s = new Action()
  s.register('user', user)
  s.call('user.isLogined').then((logined) => {
    t.true(user.inited === true && logined === false)
  })
})

test('action not exists', async t => {
  let s = new Action()
  s.register('user', user)
  s.call('user.unknowAction').then(() => {
    t.true(false)
  }).catch((err) => {
    t.true(err.message === 'Action unknowAction on user is not exists')
  })
})

test('unregister', async t => {
  let s = new Action()
  s.register('user', user)
  s.unregister('user', user)
  s.call('user.isLogined').then((logined) => {
    t.true(false)
  }).catch((err) => {
    t.true(err.message === 'Target user is not exists when called action isLogined')
  })
})

test('context', async t => {
  let s = new Action({getA: () => { return 'a' }})
  let ttt = {
    test1: ({target, resolve, getA}) => {
      target.a = getA()
      resolve()
    }
  }
  s.register('aa.bb.ttt', ttt)
  s.call('aa.bb.ttt.test1').then(() => {
    t.true(ttt.a === 'a')
  })
})

test('contexts', async t => {
  let s = new Action([
    {getA: () => { return 'a' }},
    {aaa: 111, bbb: '222'}
  ])
  let ttt = {
    test1: ({target, resolve, getA, aaa, bbb}) => {
      target.a = getA()
      target.aaa = aaa
      target.bbb = bbb
      resolve()
    }
  }
  s.register('aa.bb.ttt', ttt)
  s.call('aa.bb.ttt.test1').then(() => {
    t.true(ttt.a === 'a' && ttt.aaa === 111 && ttt.bbb === '222')
  })
})

test('login ok', async t => {
  let s = new Action()
  s.register('user', user)
  s.call('user.login', {userId: 31, password: '123456'}).then(() => {
    t.true(true)
  }).catch(() => {
    t.true(false)
  })
})

test('login failed', async t => {
  let s = new Action()
  s.register('user', user)
  s.call('user.login', {userId: '31', password: 123456}).then(() => {
    t.true(false)
  }).catch(() => {
    t.true(true)
  })
})

test('tryLogin', async t => {
  return new Promise((resolve, reject) => {
    let s = new Action()
    user.logined = false
    s.register('user', user)
    s.call('user.tryLogin', {userId: 31, password: '123456'}).then((result) => {
      t.true(result === 'just logined')

      s.call('user.tryLogin', {userId: 31, password: '123456'}).then((result) => {
        t.true(result === 'already logined')
        resolve()
      }).catch(() => {
        t.true(false)
        resolve()
      })
    }).catch(() => {
      t.true(false)
      resolve()
    })
  })
})
