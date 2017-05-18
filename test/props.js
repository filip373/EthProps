var Props = artifacts.require("./Props.sol");

contract('Props', function(accounts) {
  let instance;

  beforeEach(function() {
    return Props.new().then(function(_instance) {
      instance = _instance;
    });
  })

  describe('adding user', function() {
    let user = 'someone@test.com';

    describe('when user does NOT exist', function() {
      it('creates new user', function() {
        return instance.userExists(user).then(function(exists) {
          assert.isFalse(exists);
          return instance.addUser(user, accounts[0]);
        }).then(function() {
          return instance.userExists(user);
        }).then(function(exists) {
          assert.isTrue(exists);
        });
      });

      describe('when user already exists', function() {
        beforeEach(function() {
          return instance.addUser(user, accounts[0]);
        });

        it('does NOT change user address', function() {
          return instance.addUser(user, accounts[1]).then(function() {
            assert.fail(0, 1, 'Expected an error to be thrown');
          }).catch(function(error) {
            assert.notEqual(error.message.match('invalid opcode', undefined));
            return instance.getAccount(user);
          }).then(function(account) {
            assert.equal(account, accounts[0]);
          });
        });
      });
    });
  })

  describe('giving props', function() {
    let firstUser = 'first@test.com';
    let secondUser = 'second@test.com';
    let thirdUser = 'third@test.com';
    let fakeUser = 'someone@else.fake';

    beforeEach(function() {
      return Props.new().then(function(_instance) {
        instance = _instance;
        return Promise.all([
          instance.addUser(firstUser, accounts[0]),
          instance.addUser(secondUser, accounts[1]),
          instance.addUser(thirdUser, accounts[2])
        ]);
      });
    });

    it('registers the given props', function() {
      return instance.getPropsCount().then(function(count) {
        assert.equal(count, 0);
        return instance.giveProps(firstUser, secondUser, 'test');
      }).then(function() {
        return instance.getPropsCount();
      }).then(function(given) {
        assert.equal(given, 1);
        return instance.getProps(0);
      }).then(function(props) {
        assert.deepEqual(props, [firstUser, secondUser, 'test']);
      });
    });

    describe('when sender is giving a props to himself', function() {
      it('does NOT increment user props', function() {
        return instance.getPropsCount().then(function(given) {
          assert.equal(given, 0);
          return instance.giveProps(firstUser, firstUser, 'test');
        }).then(function() {
          assert.fail(0, 1, 'Error expected');
        }).catch(function(error) {
          assert.notEqual(error.message.match('invalid opcode', undefined));
          return instance.getPropsCount();
        }).then(function(given) {
          assert.equal(given, 0);
        });
      });
    });

    describe('when receiver email is NOT registered', function() {
      it('does NOT increment user props', function() {
        return instance.getPropsCount().then(function(given) {
          assert.equal(given, 0);
          return instance.giveProps(firstUser, fakeUser, 'test');
        }).then(function() {
          assert.fail(0, 1, 'Error expected');
        }).catch(function(error) {
          assert.notEqual(error.message.match('invalid opcode', undefined));
          return instance.getPropsCount();
        }).then(function(given) {
          assert.equal(given, 0);
        });
      })
    });

    describe('when sender email is NOT registered to current eth address', function() {
      it('does NOT increment user props', function() {
        return instance.getPropsCount().then(function(given) {
          assert.equal(given, 0);
          return instance.giveProps(secondUser, thirdUser, 'test');
        }).then(function() {
          console.log('error expected');
          assert.fail(0, 1, 'Error expected');
        }).catch(function(error) {
          console.log('catching');
          assert.notEqual(error.message.match('invalid opcode', undefined));
          return instance.getPropsCount();
        }).then(function(given) {
          assert.equal(given, 0);
        });
      })
    });

    describe('when sender email is NOT registered', function() {
      it('does NOT increment user props', function() {
        return instance.getPropsCount().then(function(given) {
          assert.equal(given, 0);
          return instance.giveProps(fakeUser, secondUser, 'test');
        }).then(function() {
          console.log('error expected');
          assert.fail(0, 1, 'Error expected');
        }).catch(function(error) {
          console.log('catching');
          assert.notEqual(error.message.match('invalid opcode', undefined));
          return instance.getPropsCount();
        }).then(function(given) {
          assert.equal(given, 0);
        });
      })
    });
  });
});