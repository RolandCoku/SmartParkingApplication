import { colors } from '@/constants/SharedStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthButton from '../components/AuthButton';

interface ParkingSpot {
  id: string;
  title: string;
  address: string;
  distance: string;
  price: string;
  spots: number;
  rating: number;
  features: string[];
  isFavorite: boolean;
  isAvailable: boolean;
  description: string;
  images: string[];
  amenities: string[];
  operatingHours: string;
  contact: string;
  reviews: {
    id: string;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

const { width: screenWidth } = Dimensions.get('window');

export default function ParkingDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Detailed parking spot data
  const parkingSpot: ParkingSpot = {
    id: '1',
    title: 'City Center Garage',
    address: '123 Main Street, Downtown District',
    distance: '0.3 km',
    price: 'Rate N/A',
    spots: 12,
    rating: 4.8,
    features: ['Covered', 'Security', 'EV Charging'],
    isFavorite: false,
    isAvailable: true,
    description: 'Modern multi-level parking garage in the heart of downtown. Features 24/7 security, covered parking, and electric vehicle charging stations. Conveniently located near shopping centers, restaurants, and business districts.',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    ],
    amenities: [
      '24/7 Security Monitoring',
      'Electric Vehicle Charging',
      'Covered Parking',
      'Elevator Access',
      'Wheelchair Accessible',
      'Car Wash Service',
      'Valet Parking Available',
    ],
    operatingHours: '24/7',
    contact: '+1 (555) 123-4567',
    reviews: [
      {
        id: '1',
        user: 'Sarah M.',
        rating: 5,
        comment: 'Great location and very secure. The EV charging stations are a huge plus!',
        date: '2 days ago',
      },
      {
        id: '2',
        user: 'Mike R.',
        rating: 4,
        comment: 'Clean and well-maintained. A bit pricey but worth it for the convenience.',
        date: '1 week ago',
      },
      {
        id: '3',
        user: 'Emily K.',
        rating: 5,
        comment: 'Excellent service and easy to find. Will definitely use again.',
        date: '2 weeks ago',
      },
    ],
  };

  const handleBookNow = () => {
    router.push('/booking');
  };

  const handleAddToWaitlist = () => {
    Alert.alert('Added to Waitlist', 'You will be notified when a spot becomes available.');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MaterialIcons
        key={index}
        name={index < Math.floor(rating) ? 'star' : 'star-border'}
        size={16}
        color="#FFD700"
      />
    ));
  };

  const renderReviewStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MaterialIcons
        key={index}
        name={index < rating ? 'star' : 'star-border'}
        size={14}
        color="#FFD700"
      />
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Parking Details</Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <MaterialIcons
            name={isFavorite ? "favorite" : "favorite-border"}
            size={24}
            color={isFavorite ? "#FF69B4" : colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setSelectedImageIndex(index);
            }}
          >
            {parkingSpot.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setShowImageModal(true)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: image }} style={styles.parkingImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {parkingSpot.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  selectedImageIndex === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Main Info */}
        <View style={styles.mainInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{parkingSpot.title}</Text>
            <View style={styles.ratingContainer}>
              {renderStars(parkingSpot.rating)}
              <Text style={styles.ratingText}>{parkingSpot.rating}</Text>
            </View>
          </View>

          <View style={styles.addressRow}>
            <MaterialIcons name="location-on" size={16} color={colors.textSecondary} />
            <Text style={styles.address}>{parkingSpot.address}</Text>
          </View>

          <View style={styles.distanceRow}>
            <MaterialIcons name="directions-walk" size={16} color={colors.textSecondary} />
            <Text style={styles.distance}>{parkingSpot.distance} away</Text>
          </View>
        </View>

        {/* Price and Availability */}
        <View style={styles.priceSection}>
          <View style={styles.priceInfo}>
            <Text style={styles.price}>{parkingSpot.price}</Text>
            <Text style={styles.priceLabel}>per hour</Text>
          </View>
          <View style={styles.availabilityInfo}>
            <View style={[
              styles.availabilityDot,
              { backgroundColor: parkingSpot.isAvailable ? '#4CAF50' : '#FF4444' }
            ]} />
            <Text style={styles.availabilityText}>
              {parkingSpot.isAvailable ? `${parkingSpot.spots} spots available` : 'Fully booked'}
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresContainer}>
            {parkingSpot.features.map((feature, index) => (
              <View key={index} style={styles.featureTag}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{parkingSpot.description}</Text>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          {parkingSpot.amenities.map((amenity, index) => (
            <View key={index} style={styles.amenityRow}>
              <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>

        {/* Operating Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          <View style={styles.hoursRow}>
            <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
            <Text style={styles.hoursText}>{parkingSpot.operatingHours}</Text>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <TouchableOpacity style={styles.contactRow}>
            <MaterialIcons name="phone" size={16} color={colors.primary} />
            <Text style={styles.contactText}>{parkingSpot.contact}</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews ({parkingSpot.reviews.length})</Text>
          {parkingSpot.reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>{review.user}</Text>
                <View style={styles.reviewRating}>
                  {renderReviewStars(review.rating)}
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.actionInfo}>
          <Text style={styles.actionPrice}>{parkingSpot.price}</Text>
          <Text style={styles.actionLabel}>per hour</Text>
        </View>
        <AuthButton
          title={parkingSpot.isAvailable ? "Book Now" : "Join Waitlist"}
          onPress={parkingSpot.isAvailable ? handleBookNow : handleAddToWaitlist}
          variant={parkingSpot.isAvailable ? "primary" : "secondary"}
          style={styles.bookButton}
        />
      </View>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModal}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowImageModal(false)}
          >
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {parkingSpot.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.modalImage} />
            ))}
          </ScrollView>
        </View>
      </Modal>
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
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  parkingImage: {
    width: screenWidth,
    height: 250,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  mainInfo: {
    padding: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
    marginRight: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  address: {
    color: colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distance: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceInfo: {
    alignItems: 'flex-start',
  },
  price: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '800',
  },
  priceLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featureText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  amenityText: {
    color: colors.text,
    fontSize: 14,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hoursText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  reviewDate: {
    color: colors.textSecondary,
    fontSize: 12,
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
  bookButton: {
    flex: 0.6,
  },
  imageModal: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  modalImage: {
    width: screenWidth,
    height: '100%',
    resizeMode: 'contain',
  },
});
