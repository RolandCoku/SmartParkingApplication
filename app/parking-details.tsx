import { colors } from '@/constants/SharedStyles';
import { ParkingLotDetailDTO, ReviewSummaryDTO } from '@/types';
import { parkingApi } from '@/utils/api';
import { isSessionExpiredError } from '@/utils/auth';
import { ApiError } from '@/utils/errors';
import { formatRate, getHighestPriorityRate } from '@/utils/rates';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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


const { width: screenWidth } = Dimensions.get('window');

export default function ParkingDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lotId } = useLocalSearchParams<{ lotId: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [parkingLot, setParkingLot] = useState<ParkingLotDetailDTO | null>(null);
  const [reviews, setReviews] = useState<ReviewSummaryDTO[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);

  useEffect(() => {
    if (lotId) {
      loadParkingLotData();
    }
  }, [lotId]);

  const loadParkingLotData = async () => {
    try {
      setLoading(true);
      
      // Load parking lot details
      const lotData = await parkingApi.getParkingLotById(Number(lotId));
      setParkingLot(lotData);
      
      // Load rate information
      try {
        const rate = await getHighestPriorityRate(Number(lotId));
        setHourlyRate(rate);
      } catch (rateError) {
        console.log('Rate not available:', rateError);
        setHourlyRate(null);
      }
      
      // Load reviews
      try {
        const reviewsResponse = await parkingApi.getParkingLotReviews(Number(lotId), 0, 10);
        setReviews(reviewsResponse.content || []);
      } catch (reviewError) {
        console.log('Reviews not available:', reviewError);
        setReviews([]);
      }
      
      // Load images
      try {
        const imagesResponse = await parkingApi.getParkingLotImages(Number(lotId));
        setImages(imagesResponse.map(img => img.imageUrl || ''));
      } catch (imageError) {
        console.log('Images not available:', imageError);
        setImages([]);
      }
      
    } catch (error) {
      if (isSessionExpiredError(error)) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login')
            }
          ]
        );
      } else if (error instanceof ApiError) {
        Alert.alert('Error', `Failed to load parking lot details: ${error.message}`);
      } else {
        Alert.alert('Error', 'Failed to load parking lot details. Please try again.');
      }
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    router.push(`/booking?lotId=${lotId}`);
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

  const formatReviewDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Parking Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading parking details...</Text>
        </View>
      </View>
    );
  }

  if (!parkingLot) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Parking Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>Failed to Load Details</Text>
          <Text style={styles.errorSubtitle}>Please try again later</Text>
          <AuthButton
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </View>
    );
  }

  // Build features array from API data
  const features = [];
  if (parkingLot.hasChargingStations) features.push('EV Charging');
  if (parkingLot.covered) features.push('Covered');
  if (parkingLot.hasCctv) features.push('Security');
  if (parkingLot.hasDisabledAccess) features.push('Disabled Access');

  // Default images if none available
  const displayImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
  ];

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
            {displayImages.map((image, index) => (
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
            {displayImages.map((_, index) => (
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
            <Text style={styles.title}>{parkingLot.name}</Text>
            <View style={styles.ratingContainer}>
              {renderStars(parkingLot.averageRating || 0)}
              <Text style={styles.ratingText}>{parkingLot.averageRating?.toFixed(1) || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.addressRow}>
            <MaterialIcons name="location-on" size={16} color={colors.textSecondary} />
            <Text style={styles.address}>{parkingLot.address}</Text>
          </View>
        </View>

        {/* Price and Availability */}
        <View style={styles.priceSection}>
          <View style={styles.priceInfo}>
            <Text style={styles.price}>{formatRate(hourlyRate)}</Text>
            <Text style={styles.priceLabel}>per hour</Text>
          </View>
          <View style={styles.availabilityInfo}>
            <View style={[
              styles.availabilityDot,
              { backgroundColor: parkingLot.availableSpaces > 0 ? '#4CAF50' : '#FF4444' }
            ]} />
            <Text style={styles.availabilityText}>
              {parkingLot.availableSpaces > 0 ? `${parkingLot.availableSpaces} spots available` : 'Fully booked'}
            </Text>
          </View>
        </View>

        {/* Features */}
        {features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresContainer}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        {parkingLot.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{parkingLot.description}</Text>
          </View>
        )}

        {/* Operating Hours */}
        {parkingLot.operatingHours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Operating Hours</Text>
            <View style={styles.hoursRow}>
              <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
              <Text style={styles.hoursText}>{parkingLot.operatingHours}</Text>
            </View>
          </View>
        )}

        {/* Contact */}
        {(parkingLot.phone || parkingLot.email) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            {parkingLot.phone && (
              <TouchableOpacity style={styles.contactRow}>
                <MaterialIcons name="phone" size={16} color={colors.primary} />
                <Text style={styles.contactText}>{parkingLot.phone}</Text>
              </TouchableOpacity>
            )}
            {parkingLot.email && (
              <TouchableOpacity style={styles.contactRow}>
                <MaterialIcons name="email" size={16} color={colors.primary} />
                <Text style={styles.contactText}>{parkingLot.email}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{review.userName}</Text>
                  <View style={styles.reviewRating}>
                    {renderReviewStars(review.rating)}
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.noReviewsContainer}>
              <MaterialIcons name="rate-review" size={32} color={colors.textSecondary} />
              <Text style={styles.noReviewsText}>No reviews yet</Text>
              <Text style={styles.noReviewsSubtext}>Be the first to review this parking lot</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.actionInfo}>
          <Text style={styles.actionPrice}>{formatRate(hourlyRate)}</Text>
          <Text style={styles.actionLabel}>per hour</Text>
        </View>
        <AuthButton
          title={parkingLot.availableSpaces > 0 ? "Book Now" : "Join Waitlist"}
          onPress={parkingLot.availableSpaces > 0 ? handleBookNow : handleAddToWaitlist}
          variant={parkingLot.availableSpaces > 0 ? "primary" : "secondary"}
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
            {displayImages.map((image, index) => (
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  noReviewsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noReviewsText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  noReviewsSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
