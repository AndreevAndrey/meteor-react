import React, { useState } from 'react';
import { Task } from './Task';
import { useTracker } from 'meteor/react-meteor-data';
import { TasksCollection } from '../db/TasksCollection';
import { TaskForm } from './TaskForm';
import { LoginForm } from './LoginForm';
import { Meteor } from 'meteor/meteor';

export const App = () => {
  const [ hideCompleted, setHideCompleted ] = useState(false);
  const hideCompletedFilter = { isChecked: { $ne: true } };
  const user = useTracker(() => Meteor.user());

  const userFilter = user ? { userId: user._id } : {};
  const pendingOnlyFilter = { ...hideCompletedFilter, ...userFilter };

  const { tasks, pendingTasksCount, isLoading } = useTracker(() => {
    const noDataAvailable = { tasks:[], pendingTasksCount: 0 };

    if (!user) {
      return noDataAvailable;
    }

    const handler = Meteor.subscribe('tasks');

    if (!handler.ready()) {
      return { ...noDataAvailable, isLoading: true }
    }
    const tasks = TasksCollection.find(hideCompleted ? pendingOnlyFilter : userFilter,
      { sort: { createdAt: -1 } })
      .fetch();

    const pendingTasksCount = TasksCollection.find(pendingOnlyFilter).count();

    return { tasks, pendingTasksCount }
  });

  const pendingTasksTitle = `${
    pendingTasksCount ? ` (${pendingTasksCount})` : ''
    }`;

  const toggleChecked = ({ _id, isChecked }) => {
    Meteor.call('tasks.setIsChecked', _id, !isChecked)
  };

  const deleteTask = ({ _id }) => Meteor.call('task.remove', _id);

  const logout = () => Meteor.logout();

  return (
    <div className='app'>
      <header>
        <div className='app-bar'>
          <div className='app-header'>
            <h1>
              📝️ To Do List
              {pendingTasksTitle}
            </h1>
          </div>
        </div>
      </header>
      {user ? (
        <>
          <div className='main'>
            <div className='user' onClick={logout}>
              {user.username} 🚪
            </div>
            <TaskForm/>
            <div className='filter'>
              <button onClick={() => setHideCompleted(!hideCompleted)}>
                {hideCompleted ? 'Show All' : 'Hide Completed'}
              </button>
            </div>
            {isLoading && <div className='loading'>loading...</div>}
            <ul className='tasks'>
              {tasks.map(task =>
                <Task key={task._id}
                      task={task}
                      onCheckboxClick={toggleChecked}
                      onDeleteClick={deleteTask}
                />)}
            </ul>
          </div>
        </>
      ) : (
        <LoginForm/>
      )}
    </div>
  );
};
