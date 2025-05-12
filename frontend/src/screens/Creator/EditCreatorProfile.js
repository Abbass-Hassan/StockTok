import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import {updateCreatorProfile} from '../../api/creatorProfileApi';
import {launchImageLibrary} from 'react-native-image-picker';
