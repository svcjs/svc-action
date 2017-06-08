import test from 'ava'
import { Action, SimpleChecker } from '../'
import user from './actions/user'

test('testChecker', async t => {
  let s = new Action()
  s.register('user', user)
  s.addFilter(SimpleChecker)
  await s.call('user.testChecker', {float: true, boolean: 1, array: 111, newType: {name: 'xxx'}}).then(() => {
    t.true(user.float === 1 && user.boolean === true && user.array[0] === 111 && user.newType.name === 'xxx')
  })
  await s.call('user.testChecker', {float: 0}).then(() => {
    t.true(user.float === 0)
  })
  await s.call('user.testChecker', {float: '111'}).then(() => {
    t.true(user.float === 111)
  })
})

test('login ok', async t => {
  let s = new Action()
  s.register('user', user)
  s.addFilter(SimpleChecker)
  s.call('user.login', {userId: '31', password: 123456}).then(() => {
    t.true(true)
  })
})

test('no password', async t => {
  let s = new Action()
  s.register('user', user)
  s.addFilter(SimpleChecker)
  s.call('user.login', {userId: '31'}).then(() => {
    t.true(false)
  }).catch((err) => {
    t.true(err.message === '[CHECK FAILED] password is requird')
  })
})

test('bad userId', async t => {
  let s = new Action()
  s.register('user', user)
  s.addFilter(SimpleChecker)
  s.call('user.login', {userId: 'aa31', password: 123456}).then(() => {
    t.true(false)
  }).catch((err) => {
    t.true(err.message === '[CHECK FAILED] userId:[aa31] check failed with ^\\d+$')
  })
})

test('bad password', async t => {
  let s = new Action()
  s.register('user', user)
  s.addFilter(SimpleChecker)
  s.call('user.login', {userId: '31', password: 12345}).then(() => {
    t.true(false)
  }).catch((err) => {
    t.true(err.message.startsWith('[CHECK FAILED] password:[12345] check failed with (value) => {'))
  })
})

test('filter priority', async t => {
  let filter1 = ({target, resolve}) => {
    target.list.push(1)
    resolve()
  }
  let filter2 = ({target, resolve}) => {
    target.list.push(2)
    resolve()
  }
  let filter3 = ({target, resolve}) => {
    target.list.push(3)
    resolve()
  }

  let s = new Action()
  s.register('user', user)
  s.addFilter(filter1)
  s.addFilter(filter2)
  s.addFilter(filter3)
  user.list = []
  s.call('user.login', {userId: 31, password: '123456'}).then(() => {
    t.true(user.list[0] === 1 && user.list[1] === 2 && user.list[2] === 3)
  })
})
