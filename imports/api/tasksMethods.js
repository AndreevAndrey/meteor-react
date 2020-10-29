import { check } from 'meteor/check';
import { TasksCollection } from '../db/TasksCollection';

const checkId = userId =>{
  if (!userId) {
    throw new Meteor.Error('Not authorized.')
  }
};

const checkUserAccess = (taskId, userId) => {
  const task = TasksCollection.findOne({ _id: taskId, userId });

  if (!task) {
    throw new Meteor.Error('Access denied.');
  }
};

Meteor.methods({
  'tasks.insert'(text) {
    check(text, String);
    checkId(this.userId);

    TasksCollection.insert({
      text,
      userId: this.userId,
      createdAt: new Date()
    })
  },

  'task.remove'(taskId) {
    check(taskId, String);
    checkId(this.userId);
    checkUserAccess(taskId,this.userId);

    TasksCollection.remove(taskId);
  },

  'tasks.setIsChecked'(taskId, isChecked) {
    check(taskId, String);
    check(isChecked, Boolean);
    checkId(this.userId);
    checkUserAccess(taskId, this.userId);

    TasksCollection.update(taskId, {
      $set: {
        isChecked
      }
    });
  }
});
