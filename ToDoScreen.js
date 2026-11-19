import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { getSavedNotes, saveNotesToStorage } from './storage/notesStorage';
import styles from './styles/styles';

const ToDoScreen = () => {
  const [notes, setNotes] = useState([]);
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // retrieve saved notes from AsyncStorage on component mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const savedNotes = await getSavedNotes();
        setNotes(savedNotes);
      } catch (error) {
        Alert.alert('Storage Error', 'Could not load saved notes.');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, []);

  const updateAndPersist = async (nextNotes) => {
    setNotes(nextNotes);
    try {
      await saveNotesToStorage(nextNotes);
    } catch (error) {
      Alert.alert('Storage Error', 'Could not save changes.');
    }
  };

  // create or update a note
  const handleSaveNote = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    let updatedNotes;

    if (editingId !== null) {
      updatedNotes = notes.map((note) =>
        note.id === editingId ? { ...note, text: trimmed } : note
      );
      setEditingId(null);
    } else {
      const newNote = {
        id: Date.now().toString(),
        text: trimmed,
        completed: false,
      };
      updatedNotes = [newNote, ...notes];
    }

    setInputText('');
    await updateAndPersist(updatedNotes);
  };

  // update the completion status of a note
  const handleToggleComplete = async (id) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, completed: !note.completed } : note
    );
    await updateAndPersist(updatedNotes);
  };

  const handleStartEdit = (note) => {
    setEditingId(note.id);
    setInputText(note.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setInputText('');
  };

  // delete a note
  const handleDeleteNote = async (id) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    if (editingId === id) {
      setEditingId(null);
      setInputText('');
    }
    await updateAndPersist(updatedNotes);
  };

  const renderItem = ({ item }) => (
    <View style={styles.noteCard}>
      <TouchableOpacity
        style={styles.noteBody}
        onPress={() => handleToggleComplete(item.id)}
      >
        <Text style={[styles.noteText, item.completed && styles.completedText]}>
          {item.completed ? '✓ ' : '• '}
          {item.text}
        </Text>
      </TouchableOpacity>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleStartEdit(item)}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNote(item.id)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Notes & To-Do</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter a note or task..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSaveNote}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveNote}>
          <Text style={styles.saveButtonText}>
            {editingId !== null ? 'Update' : 'Add'}
          </Text>
        </TouchableOpacity>
        {editingId !== null && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelEdit}
          >
            <Text style={styles.actionText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <Text style={styles.statusMessage}>Loading saved notes...</Text>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.statusMessage}>
              No notes or tasks yet. Add one above!
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ToDoScreen;