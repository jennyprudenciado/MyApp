import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@notes_todo_items_v1';

// read a stringified array from AsyncStorage and parse it into an array
export const getSavedNotes = async () => {
  const savedData = await AsyncStorage.getItem(STORAGE_KEY);
  if (savedData === null) {
    return [];
  }
  const parsed = JSON.parse(savedData);
  return Array.isArray(parsed) ? parsed : [];
};

// write a stringified array to AsyncStorage
export const saveNotesToStorage = async (notes) => {
  const jsonString = JSON.stringify(notes);
  await AsyncStorage.setItem(STORAGE_KEY, jsonString);
};