'use strict';

const common = require('../common/common');
const functions = require('../common/functions');

const expect = common.expect;
const wrapError = functions.wrapError;
const util = common.util;

const currentApp = common.currentApp;

describe('contacts', () => {
  let sampleContact = {
    Name: `Johnnies Coffee ${Math.random()}`,
    FirstName: 'John',
    LastName: 'Smith',
  };

  const newName = `Updated ${Math.random()}`;

  it('create single contact', done => {
    const contact = currentApp.core.contacts.newContact(sampleContact);
    contact
      .save()
      .then(response => {
        expect(response.entities).to.have.length.greaterThan(0);
        expect(response.entities[0].ContactID).to.not.equal('');
        expect(response.entities[0].ContactID).to.not.equal(undefined);
        expect(response.entities[0].Name).to.equal(sampleContact.Name);
        expect(response.entities[0].FirstName).to.equal(
          sampleContact.FirstName
        );
        expect(response.entities[0].LastName).to.equal(sampleContact.LastName);

        sampleContact = response.entities[0];

        done();
      })
      .catch(err => {
        console.error(err);
        done(wrapError(err));
      });
  });
  it.skip('get - modifiedAfter', done => {
    const modifiedAfter = new Date();

    // take 30 seconds ago as we just created a contact
    modifiedAfter.setTime(modifiedAfter.getTime());

    currentApp.core.contacts
      .getContacts({ modifiedAfter: modifiedAfter })
      .then(contacts => {
        expect(contacts.length).to.equal(1);
        done();
      })
      .catch(err => {
        console.error(util.inspect(err, null, null));
        done(wrapError(err));
      });
  });

  it('get (no paging)', done => {
    currentApp.core.contacts
      .getContacts()
      .then(contacts => {
        contacts.forEach(contact => {
          expect(contact.ContactID).to.not.equal('');
          expect(contact.ContactID).to.not.equal(undefined);
        });
        done();
      })
      .catch(err => {
        console.error(util.inspect(err, null, null));
        done(wrapError(err));
      });
  });
  it('get (paging)', done => {
    const onContacts = (err, response, cb) => {
      cb();
      try {
        response.data.forEach(contact => {
          expect(contact.ContactID).to.not.equal('');
          expect(contact.ContactID).to.not.equal(undefined);
        });

        if (response.finished) done();
      } catch (ex) {
        console.error(util.inspect(err, null, null));
        done(ex);
      }
    };

    currentApp.core.contacts
      .getContacts({ pager: { start: 1, callback: onContacts } })
      .catch(err => {
        console.error(util.inspect(err, null, null));
        done(wrapError(err));
      });
  });

  it('get by id', done => {
    currentApp.core.contacts
      .getContact(sampleContact.ContactID)
      .then(contact => {
        expect(contact.ContactID).to.equal(sampleContact.ContactID);
        done();
      })
      .catch(err => {
        console.error(util.inspect(err, null, null));
        done(wrapError(err));
      });
  });
  it('get - invalid modified date', done => {
    currentApp.core.contacts
      .getContacts({ modifiedAfter: 'cats' })
      .then(contacts => {
        expect(contacts.length).to.be.greaterThan(1);
        done();
      })
      .catch(err => {
        console.error(util.inspect(err, null, null));
        done(wrapError(err));
      });
  });

  it('create multiple contacts', done => {
    const contacts = [];

    for (let i = 0; i < 2; i += 1) {
      contacts.push(
        currentApp.core.contacts.newContact({
          Name: `Johnnies Coffee ${Math.random()}`,
          FirstName: `John ${Math.random()}`,
          LastName: 'Smith',
        })
      );
    }

    currentApp.core.contacts
      .saveContacts(contacts)
      .then(response => {
        expect(response.entities).to.have.length.greaterThan(0);
        response.entities.forEach(contact => {
          expect(contact.ContactID).to.not.equal('');
          expect(contact.ContactID).to.not.equal(undefined);
        });
        done();
      })
      .catch(err => {
        console.error(util.inspect(err, null, null));
        done(wrapError(err));
      });
  });

  it('update contact', done => {
    currentApp.core.contacts
      .getContact(sampleContact.ContactID)
      .then(response => {
        const thisContact = response;
        expect(thisContact.ContactID).to.equal(sampleContact.ContactID);

        thisContact.Name = newName;
        thisContact.EmailAddress = `${thisContact.FirstName}.${thisContact.LastName}@gmail.com`;
        thisContact.ContactPersons = [
          {
            FirstName: 'Johnny',
            LastName: 'Scribgibbons',
            EmailAddress: 'j.scribgib@gribbons.com',
            IncludeInEmails: true,
          },
        ];
        thisContact.Addresses = [
          {
            AddressLine1: '15 Scriby Street',
            AddressLine2: 'Preston',
            AddressLine3: 'Prestonville',
            AddressLine4: 'Scribeystanistan',
            City: 'Melbourne',
            Region: 'Victoria',
            PostalCode: '3000',
            Country: 'Australia',
            AttentionTo: 'Johnny',
            AddressType: 'STREET',
          },
        ];
        return thisContact.save();
      })
      .then(updatedContact => {
        expect(updatedContact.entities[0].Name).to.equal(newName);
        done();
      })
      .catch(err => {
        console.error(util.inspect(err, null, null));
        done(wrapError(err));
      });
  });
  it('get attachments for contacts', done => {
    currentApp.core.contacts
      .getContact(sampleContact.ContactID)
      .then(contact => {
        expect(contact.ContactID).to.equal(sampleContact.ContactID);
        contact
          .getAttachments()
          .then(() => {
            done();
          })
          .catch(err => {
            console.error(util.inspect(err, null, null));
            done(wrapError(err));
          });
      })
      .catch(err => {
        console.error(util.inspect(err, null, null));
        done(wrapError(err));
      });
  });
});