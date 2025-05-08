import React, {useState} from 'react';
import {Alert} from 'react-native';
import * as authApi from '../../api/auth';

// Import components
import AuthLayout from '../../components/specific/Auth/AuthLayout';
import Header from '../../components/specific/Auth/Header';

const ProfileCompletion = ({navigation, route}) => {
  const [loading, setLoading] = useState(false);

  return (
    <AuthLayout
      header={
        <Header title="Complete Profile" subtitle="Tell us more about you" />
      }
      form={
        // Form component will go here in the next step
        <></>
      }
    />
  );
};

export default ProfileCompletion;
