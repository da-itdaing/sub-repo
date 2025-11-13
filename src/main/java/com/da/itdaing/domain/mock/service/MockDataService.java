package com.da.itdaing.domain.mock.service;

import com.da.itdaing.domain.mock.dto.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

@Service
@Profile("local")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class MockDataService {

    private static final String POPUPS_RESOURCE = "mock/popups.json";
    private static final String SELLERS_RESOURCE = "mock/sellers.json";
    private static final String REVIEWS_RESOURCE = "mock/reviews.json";
    private static final String ZONES_RESOURCE = "mock/zones.json";
    private static final String MESSAGES_RESOURCE = "mock/messages/threads.json";
    private static final String CONSUMERS_RESOURCE = "mock/users/consumers.json";

    private static final TypeReference<List<MockPopup>> POPUP_LIST_TYPE = new TypeReference<>() {};
    private static final TypeReference<List<MockSeller>> SELLER_LIST_TYPE = new TypeReference<>() {};
    private static final TypeReference<List<MockReview>> REVIEW_LIST_TYPE = new TypeReference<>() {};
    private static final TypeReference<List<MockZone>> ZONE_LIST_TYPE = new TypeReference<>() {};
    private static final TypeReference<List<MockMessageThread>> MESSAGE_THREAD_LIST_TYPE = new TypeReference<>() {};
    private static final TypeReference<List<MockConsumerProfile>> CONSUMER_PROFILE_LIST_TYPE = new TypeReference<>() {};

    private final ObjectMapper objectMapper;
    private final Map<String, Object> cache = new ConcurrentHashMap<>();

    public List<MockPopup> getPopups() {
        return getCachedList(POPUPS_RESOURCE, () -> readResource(POPUPS_RESOURCE, POPUP_LIST_TYPE));
    }

    public Optional<MockPopup> findPopup(long popupId) {
        return getPopups().stream().filter(popup -> popup.id() == popupId).findFirst();
    }

    public List<MockSeller> getSellers() {
        return getCachedList(SELLERS_RESOURCE, () -> readResource(SELLERS_RESOURCE, SELLER_LIST_TYPE));
    }

    public Optional<MockSeller> findSeller(long sellerId) {
        return getSellers().stream().filter(seller -> seller.id() == sellerId).findFirst();
    }

    public List<MockReview> getReviews() {
        return getCachedList(REVIEWS_RESOURCE, () -> readResource(REVIEWS_RESOURCE, REVIEW_LIST_TYPE));
    }

    public List<MockReview> getReviewsByPopupId(long popupId) {
        return getReviews().stream()
            .filter(review -> review.popupId() == popupId)
            .toList();
    }

    public List<MockZone> getZones() {
        return getCachedList(ZONES_RESOURCE, () -> readResource(ZONES_RESOURCE, ZONE_LIST_TYPE));
    }

    public List<MockMessageThread> getMessageThreads() {
        return getCachedList(MESSAGES_RESOURCE, () -> readResource(MESSAGES_RESOURCE, MESSAGE_THREAD_LIST_TYPE));
    }

    public List<MockConsumerProfile> getConsumerProfiles() {
        return getCachedList(CONSUMERS_RESOURCE, () -> readResource(CONSUMERS_RESOURCE, CONSUMER_PROFILE_LIST_TYPE));
    }

    public Optional<MockConsumerProfile> getConsumerProfile(String username) {
        return getConsumerProfiles().stream()
            .filter(profile -> profile.username() != null && profile.username().equalsIgnoreCase(username))
            .findFirst();
    }

    private <T> List<T> getCachedList(String resourcePath, Supplier<List<T>> loader) {
        @SuppressWarnings("unchecked")
        List<T> cached = (List<T>) cache.computeIfAbsent(resourcePath, key -> List.copyOf(loader.get()));
        return cached;
    }

    private <T> T readResource(String resourcePath, TypeReference<T> typeReference) {
        try (InputStream inputStream = new ClassPathResource(resourcePath).getInputStream()) {
            return objectMapper.readValue(inputStream, typeReference);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read mock resource: " + resourcePath, e);
        }
    }
}

