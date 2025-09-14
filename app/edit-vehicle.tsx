import { colors } from '@/constants/SharedStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthButton from '../components/AuthButton';
import FloatingLabelInput from '../components/FloatingLabelInput';

interface CarUpdateDTO {
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
}

const CAR_BRANDS = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz',
  'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus',
  'Acura', 'Infiniti', 'Cadillac', 'Lincoln', 'Buick', 'GMC', 'Jeep',
  'Ram', 'Dodge', 'Chrysler', 'Mitsubishi', 'Volvo', 'Jaguar', 'Land Rover',
  'Porsche', 'Tesla', 'Genesis', 'Alfa Romeo', 'Fiat', 'Mini', 'Smart',
  'Other'
];

const CAR_COLORS = [
  'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Brown',
  'Gold', 'Yellow', 'Orange', 'Purple', 'Pink', 'Beige', 'Other'
];

export default function EditVehicleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { vehicleId, licensePlate, brand, model, color } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CarUpdateDTO>({
    licensePlate: (licensePlate as string) || '',
    brand: (brand as string) || '',
    model: (model as string) || '',
    color: (color as string) || '',
  });
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleInputChange = (field: keyof CarUpdateDTO, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.licensePlate.trim()) {
      Alert.alert('Error', 'Please enter a license plate number');
      return false;
    }
    if (!formData.brand.trim()) {
      Alert.alert('Error', 'Please select a car brand');
      return false;
    }
    if (!formData.model.trim()) {
      Alert.alert('Error', 'Please enter a car model');
      return false;
    }
    if (!formData.color.trim()) {
      Alert.alert('Error', 'Please select a car color');
      return false;
    }
    return true;
  };

  const handleUpdateVehicle = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`http://192.168.252.60:8080/api/v1/cars/${vehicleId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${await getAccessToken()}`
      //   },
      //   body: JSON.stringify(formData)
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Success',
        'Vehicle updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPickerModal = (
    title: string,
    items: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    visible: boolean,
    onClose: () => void
  ) => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.pickerItem,
                selectedValue === item && styles.pickerItemSelected
              ]}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Text style={[
                styles.pickerItemText,
                selectedValue === item && styles.pickerItemTextSelected
              ]}>
                {item}
              </Text>
              {selectedValue === item && (
                <MaterialIcons name="check" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.page, { paddingTop: insets.top }]}>
           {/* Header */}
           <View style={styles.header}>
             <View style={styles.headerSpacer} />
             <Text style={styles.headerTitle}>Edit Vehicle</Text>
             <View style={styles.headerSpacer} />
           </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Form */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Vehicle Information</Text>
              
              {/* License Plate */}
              <View style={styles.inputContainer}>
                <FloatingLabelInput
                  label="License Plate"
                  value={formData.licensePlate}
                  onChangeText={(value) => handleInputChange('licensePlate', value.toUpperCase())}
                  placeholder="Enter license plate"
                  autoCapitalize="characters"
                  maxLength={10}
                />
              </View>

               {/* Brand */}
               <View style={styles.inputContainer}>
                 <TouchableOpacity
                   style={styles.pickerInput}
                   onPress={() => setShowBrandPicker(true)}
                 >
                   <View style={styles.pickerInputContent}>
                     <Text style={[
                       styles.pickerInputText,
                       !formData.brand && styles.pickerInputPlaceholder
                     ]}>
                       {formData.brand || 'Select Brand'}
                     </Text>
                     <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.textSecondary} />
                   </View>
                 </TouchableOpacity>
               </View>

              {/* Model */}
              <View style={styles.inputContainer}>
                <FloatingLabelInput
                  label="Model"
                  value={formData.model}
                  onChangeText={(value) => handleInputChange('model', value)}
                  placeholder="Enter car model"
                  autoCapitalize="words"
                />
              </View>

               {/* Color */}
               <View style={styles.inputContainer}>
                 <TouchableOpacity
                   style={styles.pickerInput}
                   onPress={() => setShowColorPicker(true)}
                 >
                   <View style={styles.pickerInputContent}>
                     <Text style={[
                       styles.pickerInputText,
                       !formData.color && styles.pickerInputPlaceholder
                     ]}>
                       {formData.color || 'Select Color'}
                     </Text>
                     <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.textSecondary} />
                   </View>
                 </TouchableOpacity>
               </View>
            </View>

            {/* Preview */}
            {formData.licensePlate && formData.brand && formData.model && formData.color && (
              <View style={styles.previewSection}>
                <Text style={styles.sectionTitle}>Preview</Text>
                <View style={styles.previewCard}>
                  <View style={styles.previewHeader}>
                    <MaterialIcons name="directions-car" size={32} color={colors.primary} />
                    <View style={styles.previewInfo}>
                      <Text style={styles.previewTitle}>{formData.brand} {formData.model}</Text>
                      <Text style={styles.previewSubtitle}>{formData.licensePlate}</Text>
                    </View>
                  </View>
                  <View style={styles.previewDetails}>
                    <View style={styles.previewDetail}>
                      <MaterialIcons name="palette" size={16} color={colors.textSecondary} />
                      <Text style={styles.previewDetailText}>{formData.color}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Update Button */}
            <View style={styles.buttonContainer}>
              <AuthButton
                title="Update Vehicle"
                onPress={handleUpdateVehicle}
                loading={loading}
                variant="primary"
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Brand Picker Modal */}
      {showBrandPicker && renderPickerModal(
        'Select Brand',
        CAR_BRANDS,
        formData.brand,
        (value) => handleInputChange('brand', value),
        showBrandPicker,
        () => setShowBrandPicker(false)
      )}

      {/* Color Picker Modal */}
      {showColorPicker && renderPickerModal(
        'Select Color',
        CAR_COLORS,
        formData.color,
        (value) => handleInputChange('color', value),
        showColorPicker,
        () => setShowColorPicker(false)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  pickerInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerInputText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  pickerInputPlaceholder: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
  previewSection: {
    marginBottom: 32,
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewInfo: {
    marginLeft: 16,
    flex: 1,
  },
  previewTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  previewDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  previewDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  previewDetailText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    margin: 24,
    maxHeight: '70%',
    minWidth: '80%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerItemSelected: {
    backgroundColor: colors.background,
  },
  pickerItemText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  pickerItemTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});
