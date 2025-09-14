import { colors } from '@/constants/SharedStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthButton from '../components/AuthButton';

interface BookingData {
  parkingSpot: {
    id: string;
    title: string;
    address: string;
    price: string;
    spots: number;
  };
  selectedDate: string;
  selectedStartTime: string;
  selectedEndTime: string;
  duration: number;
  totalPrice: number;
  paymentMethod: string;
  vehicleInfo: {
    plateNumber: string;
    vehicleType: string;
  };
}

export default function BookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<'time' | 'vehicle' | 'payment' | 'confirmation'>('time');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('car');
  const [plateNumber, setPlateNumber] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [vehicleOption, setVehicleOption] = useState<'registered' | 'unregistered'>('registered');
  const [selectedRegisteredVehicle, setSelectedRegisteredVehicle] = useState('');
  
  // Mock registered vehicles data
  const registeredVehicles = [
    { id: '1', licensePlate: 'ABC-123', brand: 'Toyota', model: 'Camry', color: 'Silver', isDefault: true },
    { id: '2', licensePlate: 'XYZ-789', brand: 'Honda', model: 'Civic', color: 'Blue', isDefault: false },
    { id: '3', licensePlate: 'DEF-456', brand: 'Ford', model: 'Focus', color: 'Red', isDefault: false },
  ];
  const [hasSavedPaymentMethods, setHasSavedPaymentMethods] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  // Mock parking spot data
  const parkingSpot = {
    id: '1',
    title: 'City Center Garage',
    address: '123 Main Street, Downtown District',
    price: '$2.50',
    spots: 12,
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  const vehicleTypes = [
    { id: 'car', label: 'Car', icon: 'directions-car' },
    { id: 'motorcycle', label: 'Motorcycle', icon: 'motorcycle' },
    { id: 'truck', label: 'Truck', icon: 'local-shipping' },
    { id: 'van', label: 'Van', icon: 'airport-shuttle' },
  ];


  const paymentMethods = [
    { id: 'card', label: 'Credit/Debit Card', icon: 'credit-card' },
    { id: 'paypal', label: 'PayPal', icon: 'account-balance-wallet' },
    { id: 'apple', label: 'Apple Pay', icon: 'phone-iphone' },
    { id: 'google', label: 'Google Pay', icon: 'android' },
  ];

  const savedPaymentMethods = [
    { id: '1', type: 'card', last4: '4242', brand: 'Visa', expiryMonth: '12', expiryYear: '25', isDefault: true },
    { id: '2', type: 'card', last4: '5555', brand: 'Mastercard', expiryMonth: '08', expiryYear: '26', isDefault: false },
  ];

  // Mock availability data - dates that are available for booking
  const availableDates = [
    new Date().toISOString().split('T')[0], // Today
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Day after tomorrow
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +3 days
    new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +4 days
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +5 days
    new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +6 days
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 days
  ];

  const calculateDuration = () => {
    if (!selectedStartTime || !selectedEndTime) return 0;
    const start = new Date(`2000-01-01T${selectedStartTime}`);
    const end = new Date(`2000-01-01T${selectedEndTime}`);
    return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
  };

  const calculateTotalPrice = () => {
    const duration = calculateDuration();
    const hourlyRate = parseFloat(parkingSpot.price.replace('$', ''));
    return duration * hourlyRate;
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'time':
        if (!selectedStartTime || !selectedEndTime) {
          Alert.alert('Error', 'Please select both start and end times');
          return;
        }
        if (calculateDuration() <= 0) {
          Alert.alert('Error', 'End time must be after start time');
          return;
        }
        setCurrentStep('vehicle');
        break;
      case 'vehicle':
        if (vehicleOption === 'unregistered' && !plateNumber.trim()) {
          Alert.alert('Error', 'Please enter your license plate number');
          return;
        }
        if (vehicleOption === 'registered' && !selectedRegisteredVehicle) {
          Alert.alert('Error', 'Please select a registered vehicle');
          return;
        }
        setCurrentStep('payment');
        break;
      case 'payment':
        if (selectedPaymentMethod === 'card' && !hasSavedPaymentMethods && !showPaymentForm) {
          Alert.alert(
            'Payment Method Required',
            'You need to add a payment method to continue. Would you like to add one now?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Add Payment Method', onPress: () => setShowPaymentForm(true) },
            ]
          );
          return;
        }
        if (showPaymentForm && (!paymentFormData.cardNumber || !paymentFormData.expiryDate || !paymentFormData.cvv || !paymentFormData.cardholderName)) {
          Alert.alert('Error', 'Please fill in all payment details');
          return;
        }
        setCurrentStep('confirmation');
        break;
      case 'confirmation':
        handleConfirmBooking();
        break;
    }
  };


  const handleConfirmBooking = () => {
    Alert.alert(
      'Booking Confirmed!',
      `Your parking spot at ${parkingSpot.title} has been reserved for ${selectedDate} from ${selectedStartTime} to ${selectedEndTime}.`,
      [
        {
          text: 'OK',
          onPress: () => router.replace('/bookings'),
        },
      ]
    );
  };

  // Calendar component
  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of current month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const renderCalendarDays = () => {
      const days = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(
          <View key={`empty-${i}`} style={styles.calendarDayEmpty} />
        );
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isAvailable = availableDates.includes(dateString);
        const isSelected = selectedDate === dateString;
        const isToday = dateString === today.toISOString().split('T')[0];
        
        days.push(
          <TouchableOpacity
            key={day}
            style={[
              styles.calendarDay,
              isSelected && styles.calendarDaySelected,
              isToday && styles.calendarDayToday,
              !isAvailable && styles.calendarDayUnavailable
            ]}
            onPress={() => {
              if (isAvailable) {
                setSelectedDate(dateString);
                setShowCalendarModal(false);
              }
            }}
            disabled={!isAvailable}
          >
            <Text style={[
              styles.calendarDayText,
              isSelected && styles.calendarDayTextSelected,
              isToday && styles.calendarDayTextToday,
              !isAvailable && styles.calendarDayTextUnavailable
            ]}>
              {day}
            </Text>
          </TouchableOpacity>
        );
      }
      
      return days;
    };
    
    return (
      <Modal
        visible={showCalendarModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={[styles.calendarModal, { paddingTop: insets.top }]}>
          {/* Calendar Header */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.calendarCloseButton}
              onPress={() => setShowCalendarModal(false)}
            >
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>Select Date</Text>
            <View style={styles.calendarHeaderSpacer} />
          </View>
          
          {/* Month/Year Header */}
          <View style={styles.calendarMonthHeader}>
            <Text style={styles.calendarMonthText}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
          </View>
          
          {/* Day Names Header */}
          <View style={styles.calendarDayNames}>
            {dayNames.map((dayName) => (
              <Text key={dayName} style={styles.calendarDayName}>
                {dayName}
              </Text>
            ))}
          </View>
          
          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {renderCalendarDays()}
          </View>
          
          {/* Legend */}
          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendAvailable]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendUnavailable]} />
              <Text style={styles.legendText}>Unavailable</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendToday]} />
              <Text style={styles.legendText}>Today</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderTimeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Date & Time</Text>
      
      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date</Text>
        <TouchableOpacity 
          style={styles.dateContainer}
          activeOpacity={0.7}
          onPress={() => setShowCalendarModal(true)}
        >
          <MaterialIcons name="calendar-today" size={20} color={colors.textSecondary} />
          <Text style={styles.dateText}>{new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Start Time */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Start Time</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScrollView}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={`start-${time}`}
              style={[styles.timeSlot, selectedStartTime === time && styles.timeSlotSelected]}
              onPress={() => setSelectedStartTime(time)}
            >
              <Text style={[styles.timeSlotText, selectedStartTime === time && styles.timeSlotTextSelected]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* End Time */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>End Time</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScrollView}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={`end-${time}`}
              style={[
                styles.timeSlot, 
                selectedEndTime === time && styles.timeSlotSelected,
                selectedStartTime && time <= selectedStartTime && styles.timeSlotDisabled
              ]}
              onPress={() => setSelectedEndTime(time)}
              disabled={selectedStartTime ? time <= selectedStartTime : false}
            >
              <Text style={[
                styles.timeSlotText, 
                selectedEndTime === time && styles.timeSlotTextSelected,
                selectedStartTime && time <= selectedStartTime && styles.timeSlotTextDisabled
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Duration & Price Preview */}
      {selectedStartTime && selectedEndTime && (
        <View style={styles.previewContainer}>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Duration:</Text>
            <Text style={styles.previewValue}>{calculateDuration()} hours</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Total Price:</Text>
            <Text style={styles.previewPrice}>${calculateTotalPrice().toFixed(2)}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderVehicleSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Vehicle Information</Text>
      
      {/* Vehicle Option Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Vehicle Option</Text>
        <View style={styles.optionContainer}>
          <TouchableOpacity
            style={[styles.optionCard, vehicleOption === 'registered' && styles.optionCardSelected]}
            onPress={() => setVehicleOption('registered')}
          >
            <MaterialIcons 
              name="directions-car" 
              size={24} 
              color={vehicleOption === 'registered' ? '#000000' : colors.textSecondary} 
            />
            <Text style={[styles.optionText, vehicleOption === 'registered' && styles.optionTextSelected]}>
              Registered Vehicle
            </Text>
            <Text style={styles.optionSubtext}>Select from saved vehicles</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.optionCard, vehicleOption === 'unregistered' && styles.optionCardSelected]}
            onPress={() => setVehicleOption('unregistered')}
          >
            <MaterialIcons 
              name="edit" 
              size={24} 
              color={vehicleOption === 'unregistered' ? '#000000' : colors.textSecondary} 
            />
            <Text style={[styles.optionText, vehicleOption === 'unregistered' && styles.optionTextSelected]}>
              Enter License Plate
            </Text>
            <Text style={styles.optionSubtext}>For unregistered vehicles</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Registered Vehicles Selection */}
      {vehicleOption === 'registered' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Vehicle</Text>
            <TouchableOpacity
              style={styles.manageVehiclesButton}
              onPress={() => router.push('/my-vehicles')}
            >
              <MaterialIcons name="settings" size={16} color={colors.primary} />
              <Text style={styles.manageVehiclesText}>Manage</Text>
            </TouchableOpacity>
          </View>
          
          {registeredVehicles.length > 0 ? (
            registeredVehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[styles.registeredVehicleCard, selectedRegisteredVehicle === vehicle.id && styles.registeredVehicleCardSelected]}
                onPress={() => setSelectedRegisteredVehicle(vehicle.id)}
              >
                <View style={styles.vehicleInfo}>
                  <MaterialIcons 
                    name="directions-car" 
                    size={24} 
                    color={selectedRegisteredVehicle === vehicle.id ? '#000000' : colors.textSecondary} 
                  />
                  <View style={styles.vehicleDetails}>
                    <Text style={[styles.vehicleNickname, selectedRegisteredVehicle === vehicle.id && styles.vehicleNicknameSelected]}>
                      {vehicle.brand} {vehicle.model}
                    </Text>
                    <Text style={styles.vehiclePlate}>{vehicle.licensePlate}</Text>
                    <Text style={styles.vehicleColor}>{vehicle.color}</Text>
                  </View>
                </View>
                {vehicle.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
                {selectedRegisteredVehicle === vehicle.id && (
                  <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noVehiclesContainer}>
              <MaterialIcons name="directions-car" size={48} color={colors.textSecondary} />
              <Text style={styles.noVehiclesTitle}>No Vehicles Registered</Text>
              <Text style={styles.noVehiclesSubtitle}>Add a vehicle to make booking easier</Text>
              <TouchableOpacity
                style={styles.addVehicleButton}
                onPress={() => router.push('/register-vehicle')}
              >
                <MaterialIcons name="add" size={16} color="#000000" />
                <Text style={styles.addVehicleButtonText}>Add Vehicle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* License Plate Input */}
      {vehicleOption === 'unregistered' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>License Plate Number</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="confirmation-number" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your license plate number"
              placeholderTextColor={colors.textSecondary}
              value={plateNumber}
              onChangeText={setPlateNumber}
              autoCapitalize="characters"
              maxLength={10}
            />
          </View>
          
          {/* Vehicle Type for Unregistered */}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Vehicle Type</Text>
          <View style={styles.vehicleTypeContainer}>
            {vehicleTypes.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[styles.vehicleTypeCard, selectedVehicleType === vehicle.id && styles.vehicleTypeCardSelected]}
                onPress={() => setSelectedVehicleType(vehicle.id)}
              >
                <MaterialIcons 
                  name={vehicle.icon as any} 
                  size={24} 
                  color={selectedVehicleType === vehicle.id ? '#000000' : colors.textSecondary} 
                />
                <Text style={[styles.vehicleTypeText, selectedVehicleType === vehicle.id && styles.vehicleTypeTextSelected]}>
                  {vehicle.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderPaymentSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Payment Method</Text>
      
      {/* Saved Payment Methods */}
      {savedPaymentMethods.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
          {savedPaymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.savedPaymentCard, selectedPaymentMethod === method.id && styles.savedPaymentCardSelected]}
              onPress={() => {
                setSelectedPaymentMethod(method.id);
                setHasSavedPaymentMethods(true);
                setShowPaymentForm(false);
              }}
            >
              <View style={styles.paymentMethodInfo}>
                <MaterialIcons name="credit-card" size={24} color={colors.textSecondary} />
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentBrand}>{method.brand} •••• {method.last4}</Text>
                  <Text style={styles.paymentExpiry}>Expires {method.expiryMonth}/{method.expiryYear}</Text>
                </View>
              </View>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
              {selectedPaymentMethod === method.id && (
                <MaterialIcons name="check-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Add New Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add New Payment Method</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[styles.paymentMethodCard, selectedPaymentMethod === method.id && styles.paymentMethodCardSelected]}
            onPress={() => {
              setSelectedPaymentMethod(method.id);
              if (method.id === 'card') {
                setShowPaymentForm(true);
                setHasSavedPaymentMethods(false);
              }
            }}
          >
            <MaterialIcons 
              name={method.icon as any} 
              size={24} 
              color={selectedPaymentMethod === method.id ? '#000000' : colors.textSecondary} 
            />
            <Text style={[styles.paymentMethodText, selectedPaymentMethod === method.id && styles.paymentMethodTextSelected]}>
              {method.label}
            </Text>
            {selectedPaymentMethod === method.id && (
              <MaterialIcons name="check-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Payment Form */}
      {showPaymentForm && selectedPaymentMethod === 'card' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Details</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Card Number</Text>
            <TextInput
              style={styles.formInput}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={colors.textSecondary}
              value={paymentFormData.cardNumber}
              onChangeText={(text) => setPaymentFormData(prev => ({ ...prev, cardNumber: text }))}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.formLabel}>Expiry Date</Text>
              <TextInput
                style={styles.formInput}
                placeholder="MM/YY"
                placeholderTextColor={colors.textSecondary}
                value={paymentFormData.expiryDate}
                onChangeText={(text) => setPaymentFormData(prev => ({ ...prev, expiryDate: text }))}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.formLabel}>CVV</Text>
              <TextInput
                style={styles.formInput}
                placeholder="123"
                placeholderTextColor={colors.textSecondary}
                value={paymentFormData.cvv}
                onChangeText={(text) => setPaymentFormData(prev => ({ ...prev, cvv: text }))}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="John Doe"
              placeholderTextColor={colors.textSecondary}
              value={paymentFormData.cardholderName}
              onChangeText={(text) => setPaymentFormData(prev => ({ ...prev, cardholderName: text }))}
              autoCapitalize="words"
            />
          </View>
        </View>
      )}

      {/* Booking Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Location:</Text>
          <Text style={styles.summaryValue}>{parkingSpot.title}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date:</Text>
          <Text style={styles.summaryValue}>{new Date(selectedDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Time:</Text>
          <Text style={styles.summaryValue}>{selectedStartTime} - {selectedEndTime}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>{calculateDuration()} hours</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Vehicle:</Text>
          <Text style={styles.summaryValue}>
            {vehicleOption === 'registered' 
              ? (() => {
                  const vehicle = registeredVehicles.find(v => v.id === selectedRegisteredVehicle);
                  return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : 'Selected Vehicle';
                })()
              : `${plateNumber} • ${vehicleTypes.find(v => v.id === selectedVehicleType)?.label}`
            }
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotalRow]}>
          <Text style={styles.summaryTotalLabel}>Total:</Text>
          <Text style={styles.summaryTotalPrice}>${calculateTotalPrice().toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.stepContainer}>
      <View style={styles.confirmationHeader}>
        <MaterialIcons name="check-circle" size={64} color="#4CAF50" />
        <Text style={styles.confirmationTitle}>Confirm Your Booking</Text>
        <Text style={styles.confirmationSubtitle}>Review your details before confirming</Text>
      </View>

      <View style={styles.confirmationDetails}>
        <View style={styles.confirmationCard}>
          <Text style={styles.confirmationCardTitle}>Parking Details</Text>
          <Text style={styles.confirmationCardText}>{parkingSpot.title}</Text>
          <Text style={styles.confirmationCardSubtext}>{parkingSpot.address}</Text>
        </View>

        <View style={styles.confirmationCard}>
          <Text style={styles.confirmationCardTitle}>Booking Details</Text>
          <Text style={styles.confirmationCardText}>
            {new Date(selectedDate).toLocaleDateString()} • {selectedStartTime} - {selectedEndTime}
          </Text>
          <Text style={styles.confirmationCardSubtext}>
            {calculateDuration()} hours • {
              vehicleOption === 'registered' 
                ? registeredVehicles.find(v => v.id === selectedRegisteredVehicle)?.nickname || 'Selected Vehicle'
                : `${plateNumber} • ${vehicleTypes.find(v => v.id === selectedVehicleType)?.label}`
            }
          </Text>
        </View>

        <View style={styles.confirmationCard}>
          <Text style={styles.confirmationCardTitle}>Payment</Text>
          <Text style={styles.confirmationCardText}>
            {paymentMethods.find(p => p.id === selectedPaymentMethod)?.label}
          </Text>
          <Text style={styles.confirmationTotalPrice}>${calculateTotalPrice().toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 'time': return 'Select Time';
      case 'vehicle': return 'Vehicle Info';
      case 'payment': return 'Payment';
      case 'confirmation': return 'Confirm';
      default: return 'Booking';
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 'confirmation': return 'Confirm Booking';
      default: return 'Continue';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>{getStepTitle()}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {['time', 'vehicle', 'payment', 'confirmation'].map((step, index) => (
          <View key={step} style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              (['time', 'vehicle', 'payment', 'confirmation'].indexOf(currentStep) >= index) && styles.progressDotActive
            ]} />
            {index < 3 && <View style={styles.progressLine} />}
          </View>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 'time' && renderTimeSelection()}
        {currentStep === 'vehicle' && renderVehicleSelection()}
        {currentStep === 'payment' && renderPaymentSelection()}
        {currentStep === 'confirmation' && renderConfirmation()}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.actionInfo}>
          <Text style={styles.actionPrice}>${calculateTotalPrice().toFixed(2)}</Text>
          <Text style={styles.actionLabel}>Total</Text>
        </View>
        <AuthButton
          title={getButtonText()}
          onPress={handleNext}
          variant="primary"
        />
      </View>

      {/* Calendar Modal */}
      {renderCalendar()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: colors.surface,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 24,
  },
  stepTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  dateText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  timeScrollView: {
    marginHorizontal: -4,
  },
  timeSlot: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 4,
    alignItems: 'center',
    minWidth: 60,
  },
  timeSlotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeSlotDisabled: {
    opacity: 0.3,
  },
  timeSlotText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  timeSlotTextSelected: {
    color: '#000000',
  },
  timeSlotTextDisabled: {
    color: colors.textSecondary,
  },
  previewContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  previewValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  previewPrice: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  optionContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  optionTextSelected: {
    color: '#000000',
  },
  optionSubtext: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  registeredVehicleCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  registeredVehicleCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleNickname: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  vehicleNicknameSelected: {
    color: '#000000',
  },
  vehiclePlate: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleColor: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  manageVehiclesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 4,
  },
  manageVehiclesText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  defaultBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },
  noVehiclesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noVehiclesTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  noVehiclesSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  addVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addVehicleButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  vehicleTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vehicleTypeCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    minWidth: 80,
    gap: 8,
  },
  vehicleTypeCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  vehicleTypeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  vehicleTypeTextSelected: {
    color: '#000000',
  },
  inputContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  savedPaymentCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  savedPaymentCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentBrand: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentExpiry: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  defaultBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  defaultBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  paymentMethodCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentMethodCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paymentMethodText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodTextSelected: {
    color: '#000000',
  },
  summaryContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  summaryTotalLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  summaryTotalPrice: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  confirmationTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  confirmationSubtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  confirmationDetails: {
    gap: 16,
  },
  confirmationCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmationCardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  confirmationCardText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  confirmationCardSubtext: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  confirmationTotalPrice: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 24,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionInfo: {
    alignItems: 'flex-start',
  },
  actionPrice: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  // Calendar Modal Styles
  calendarModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  calendarCloseButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  calendarTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  calendarHeaderSpacer: {
    width: 40,
  },
  calendarMonthHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  calendarMonthText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  calendarDayNames: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  calendarDayName: {
    flex: 1,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  calendarDayEmpty: {
    width: '14.28%',
    height: 48,
  },
  calendarDay: {
    width: '14.28%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  calendarDaySelected: {
    backgroundColor: colors.primary,
  },
  calendarDayToday: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  calendarDayUnavailable: {
    opacity: 0.3,
  },
  calendarDayText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  calendarDayTextSelected: {
    color: '#000000',
    fontWeight: '800',
  },
  calendarDayTextToday: {
    color: colors.primary,
    fontWeight: '800',
  },
  calendarDayTextUnavailable: {
    color: colors.textSecondary,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 24,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendAvailable: {
    backgroundColor: colors.primary,
  },
  legendUnavailable: {
    backgroundColor: colors.textSecondary,
  },
  legendToday: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
