const Firestore = require('@google-cloud/firestore');

const keys = require('../config/prod');

const {capitalize} = require('../utils/capitalize');

const projectId = keys.projectId;

const db = new Firestore({
  projectId: projectId,
});

const devicesRef = db.collection('devices');

const usersRef = db.collection('users');

exports.getDevicesWithUserInfo = async () => {
  try {
    const snapshot = await devicesRef.get();
    const data = snapshot.docs.map(doc => {
      const data = doc.data();
      return {deviceID: data.deviceID, user: data.user};
    });
    for (let index = 0; index < data.length; index++) {
      const device = data[index];
      const userId = device.user;

      const doc = await usersRef.doc(userId).get();
      const userInfo = doc.data();
      device.user = {
        name: capitalize(`${userInfo.name} ${userInfo.lastName}`),
        email: userInfo.email,
        photo: userInfo.photo,
      };
    }
    return data;
  } catch (error) {
    throw new Error(error);
  }
};

exports.getUserByDevice = async id => {
  try {
    const snapshot = await devicesRef.doc(id).get();
    const device = snapshot.data();
    const userId = device.user;
    const doc = await usersRef.doc(userId).get();
    const userInfo = doc.data();
    return {
      name: capitalize(`${userInfo.name} ${userInfo.lastName}`),
      email: userInfo.email,
      photo: userInfo.photo,
    };
  } catch (error) {
    throw new Error(error);
  }
};