import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-community/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Text, View, Picker } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  BorderlessButton,
  RectButton,
  ScrollView,
  TextInput,
} from 'react-native-gesture-handler';
import PageHeader from '../../components/PageHeader';
import TeacherItem, { Teacher } from '../../components/TeacherItem';
import api from '../../services/api';
import moment from 'moment';
import styles from './styles';

const TeacherList = () => {
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [teachers, setTeachers] = useState([]);

  const [subject, setSubject] = useState('Matemática');
  const [weekDay, setWeekDay] = useState(1);
  const [time, setTime] = useState(new Date());
  const [show, setShow] = useState(false);

  const loadFavorites = () => {
    AsyncStorage.getItem('favorites').then((response) => {
      if (response) {
        const favoritedTeachers = JSON.parse(response);
        const favoritedTeachersId = favoritedTeachers.map(
          (teacher: Teacher) => teacher.id
        );

        setFavorites(favoritedTeachersId);
      }
    });
  };

  const handleToggleFiltersVisible = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  const handleFiltersSubmit = async () => {
    loadFavorites();
    const response = await api.get('classes', {
      params: {
        subject,
        week_day: weekDay,
        time: moment(time).format('HH:mm'),
      },
    });
    setTeachers(response.data);
    setIsFiltersVisible(false);
  };

  useFocusEffect(() => {
    loadFavorites();
  });

  return (
    <View style={styles.container}>
      <PageHeader
        title='Proffys disponíveis'
        headerRight={
          <BorderlessButton onPress={handleToggleFiltersVisible}>
            <Feather name='filter' size={20} color='#fff' />
          </BorderlessButton>
        }
      >
        {isFiltersVisible && (
          <View style={styles.searchForm}>
            <Text style={styles.label}>Matéria</Text>
            <TextInput
              style={styles.input}
              placeholder='Qual a máteria?'
              placeholderTextColor='#c1bccc'
              value={subject}
              onChangeText={(text) => setSubject(text)}
            />

            <View style={styles.inputGroup}>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Dia da semana</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={weekDay}
                    onValueChange={(itemValue) => setWeekDay(itemValue)}
                  >
                    <Picker.Item label='Domingo' value={1} />
                    <Picker.Item label='Segunda-Feira' value={2} />
                    <Picker.Item label='Terça-Feira' value={3} />
                    <Picker.Item label='Quarta-Feira' value={4} />
                    <Picker.Item label='Quinta-Feira' value={5} />
                    <Picker.Item label='Sexta-Feira' value={6} />
                    <Picker.Item label='Sábado' value={7} />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>Horário</Text>
                {show && (
                  <DateTimePicker
                    value={time}
                    style={styles.picker}
                    is24Hour
                    onChange={(event, selectedDate) => {
                      const currentDate = selectedDate || time;
                      setShow(false);
                      setTime(currentDate);
                    }}
                    mode='time'
                    display='spinner'
                  />
                )}
                <TextInput
                  style={styles.input}
                  value={moment(time).format('HH:mm')}
                  onFocus={() => setShow(true)}
                  placeholder='__:__'
                />
              </View>
            </View>

            <RectButton
              onPress={handleFiltersSubmit}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Filtrar</Text>
            </RectButton>
          </View>
        )}
      </PageHeader>
      <ScrollView
        style={styles.teacherList}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      >
        {teachers.map((teacher: Teacher) => (
          <TeacherItem
            key={teacher.id}
            teacher={teacher}
            favorited={favorites.includes(teacher.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default TeacherList;
