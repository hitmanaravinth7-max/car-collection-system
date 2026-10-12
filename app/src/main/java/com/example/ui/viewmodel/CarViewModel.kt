package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.AvailabilityStatus
import com.example.data.model.Car
import com.example.data.model.FuelType
import com.example.data.model.TransmissionType
import com.example.data.model.User
import com.example.data.repository.AuthRepository
import com.example.data.repository.CarRepository
import com.example.ui.navigation.NavigationTab
import com.example.ui.navigation.Screen
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class SortOption(val displayName: String) {
    DATE_ADDED("Recently Added"),
    PRICE_HIGH_TO_LOW("Price: High to Low"),
    PRICE_LOW_TO_HIGH("Price: Low to High"),
    YEAR_NEWEST("Year: Newest First"),
    YEAR_OLDEST("Year: Oldest First"),
    MILEAGE_LOW("Mileage: Low to High")
}

data class DashboardStats(
    val totalCars: Int = 0,
    val availableCars: Int = 0,
    val soldCars: Int = 0,
    val reservedCars: Int = 0,
    val maintenanceCars: Int = 0,
    val totalValue: Double = 0.0,
    val averageValue: Double = 0.0,
    val fuelDistribution: Map<FuelType, Int> = emptyMap(),
    val statusDistribution: Map<AvailabilityStatus, Int> = emptyMap(),
    val brandDistribution: Map<String, Int> = emptyMap(),
    val recentCars: List<Car> = emptyList()
)

class CarViewModel(
    private val carRepository: CarRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    // Current navigation state
    private val screenStack = mutableListOf<Screen>(Screen.Dashboard)
    private val _currentScreen = MutableStateFlow<Screen>(Screen.Dashboard)
    val currentScreen: StateFlow<Screen> = _currentScreen.asStateFlow()

    private val _currentTab = MutableStateFlow(NavigationTab.DASHBOARD)
    val currentTab: StateFlow<NavigationTab> = _currentTab.asStateFlow()

    // Auth State
    val currentUser: StateFlow<User?> = authRepository.currentUser

    // All Cars Flow
    val allCars: StateFlow<List<Car>> = carRepository.allCars
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Search and Filter States
    val searchQuery = MutableStateFlow("")
    val selectedBrand = MutableStateFlow<String?>(null)
    val selectedFuelType = MutableStateFlow<FuelType?>(null)
    val selectedStatus = MutableStateFlow<AvailabilityStatus?>(null)
    val selectedTransmission = MutableStateFlow<TransmissionType?>(null)
    val sortOption = MutableStateFlow(SortOption.DATE_ADDED)

    // Delete Confirmation Dialog State
    val carToDelete = MutableStateFlow<Car?>(null)

    // User Feedback Messages
    private val _snackbarMessage = MutableSharedFlow<String>()
    val snackbarMessage: SharedFlow<String> = _snackbarMessage.asSharedFlow()

    init {
        viewModelScope.launch {
            carRepository.ensureSampleDataLoaded()
        }
    }

    private val filterGroup1 = combine(
        searchQuery,
        selectedBrand,
        selectedFuelType
    ) { q, b, f -> Triple(q, b, f) }

    private val filterGroup2 = combine(
        selectedStatus,
        selectedTransmission,
        sortOption
    ) { s, t, sort -> Triple(s, t, sort) }

    // Filtered & Sorted Cars
    val filteredCars: StateFlow<List<Car>> = combine(
        allCars,
        filterGroup1,
        filterGroup2
    ) { cars, g1, g2 ->
        val (query, brand, fuel) = g1
        val (status, transmission, sort) = g2
        var list = cars

        if (query.isNotBlank()) {
            val q = query.trim().lowercase()
            list = list.filter {
                it.brand.lowercase().contains(q) ||
                it.model.lowercase().contains(q) ||
                it.registrationNumber.lowercase().contains(q) ||
                it.color.lowercase().contains(q) ||
                it.manufacturingYear.toString().contains(q)
            }
        }

        if (brand != null && brand.isNotBlank() && brand != "All") {
            list = list.filter { it.brand.equals(brand, ignoreCase = true) }
        }

        if (fuel != null) {
            list = list.filter { it.fuelType == fuel }
        }

        if (status != null) {
            list = list.filter { it.availabilityStatus == status }
        }

        if (transmission != null) {
            list = list.filter { it.transmissionType == transmission }
        }

        when (sort) {
            SortOption.DATE_ADDED -> list.sortedByDescending { it.createdAt }
            SortOption.PRICE_HIGH_TO_LOW -> list.sortedByDescending { it.price }
            SortOption.PRICE_LOW_TO_HIGH -> list.sortedBy { it.price }
            SortOption.YEAR_NEWEST -> list.sortedByDescending { it.manufacturingYear }
            SortOption.YEAR_OLDEST -> list.sortedBy { it.manufacturingYear }
            SortOption.MILEAGE_LOW -> list.sortedBy { it.mileage }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Dashboard Statistics
    val dashboardStats: StateFlow<DashboardStats> = allCars.combine(MutableStateFlow(Unit)) { cars, _ ->
        val total = cars.size
        val available = cars.count { it.availabilityStatus == AvailabilityStatus.AVAILABLE }
        val sold = cars.count { it.availabilityStatus == AvailabilityStatus.SOLD }
        val reserved = cars.count { it.availabilityStatus == AvailabilityStatus.RESERVED }
        val maintenance = cars.count { it.availabilityStatus == AvailabilityStatus.MAINTENANCE }
        val totalVal = cars.sumOf { it.price }
        val avgVal = if (total > 0) totalVal / total else 0.0

        val fuelMap = FuelType.entries.associateWith { type -> cars.count { it.fuelType == type } }
        val statusMap = AvailabilityStatus.entries.associateWith { s -> cars.count { it.availabilityStatus == s } }
        val brandMap = cars.groupBy { it.brand }.mapValues { it.value.size }
        val recents = cars.sortedByDescending { it.createdAt }.take(5)

        DashboardStats(
            totalCars = total,
            availableCars = available,
            soldCars = sold,
            reservedCars = reserved,
            maintenanceCars = maintenance,
            totalValue = totalVal,
            averageValue = avgVal,
            fuelDistribution = fuelMap,
            statusDistribution = statusMap,
            brandDistribution = brandMap,
            recentCars = recents
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), DashboardStats())

    // Navigation Methods
    fun navigateTo(screen: Screen) {
        if (_currentScreen.value != screen) {
            screenStack.add(screen)
            _currentScreen.value = screen
            updateActiveTab(screen)
        }
    }

    fun navigateBack(): Boolean {
        if (screenStack.size > 1) {
            screenStack.removeAt(screenStack.size - 1)
            val previous = screenStack.last()
            _currentScreen.value = previous
            updateActiveTab(previous)
            return true
        }
        return false
    }

    fun selectTab(tab: NavigationTab) {
        _currentTab.value = tab
        when (tab) {
            NavigationTab.DASHBOARD -> navigateTo(Screen.Dashboard)
            NavigationTab.CARS -> navigateTo(Screen.ViewAllCars)
            NavigationTab.GALLERY -> navigateTo(Screen.Gallery)
            NavigationTab.ABOUT -> navigateTo(Screen.About)
            NavigationTab.CONTACT -> navigateTo(Screen.Contact)
        }
    }

    private fun updateActiveTab(screen: Screen) {
        when (screen) {
            is Screen.Dashboard -> _currentTab.value = NavigationTab.DASHBOARD
            is Screen.ViewAllCars -> _currentTab.value = NavigationTab.CARS
            is Screen.Gallery -> _currentTab.value = NavigationTab.GALLERY
            is Screen.About -> _currentTab.value = NavigationTab.ABOUT
            is Screen.Contact -> _currentTab.value = NavigationTab.CONTACT
            else -> {}
        }
    }

    // CRUD Actions
    fun saveCar(car: Car, isEditing: Boolean) {
        viewModelScope.launch {
            if (isEditing) {
                carRepository.updateCar(car)
                _snackbarMessage.emit("Updated vehicle ${car.brand} ${car.model} successfully!")
            } else {
                carRepository.insertCar(car)
                _snackbarMessage.emit("Added vehicle ${car.brand} ${car.model} to collection!")
            }
            navigateTo(Screen.ViewAllCars)
        }
    }

    fun deleteCar(carId: String) {
        viewModelScope.launch {
            carRepository.deleteCar(carId)
            carToDelete.value = null
            _snackbarMessage.emit("Car removed from collection")
            if (_currentScreen.value is Screen.CarDetails) {
                navigateTo(Screen.ViewAllCars)
            }
        }
    }

    fun updateCarStatus(carId: String, newStatus: AvailabilityStatus) {
        viewModelScope.launch {
            val car = allCars.value.firstOrNull { it.id == carId }
            if (car != null) {
                val updated = car.copy(availabilityStatus = newStatus)
                carRepository.updateCar(updated)
                _snackbarMessage.emit("Status updated to ${newStatus.displayName}")
            }
        }
    }

    fun resetDemoData() {
        viewModelScope.launch {
            carRepository.resetToSampleData()
            _snackbarMessage.emit("Reset collection to sample showcase fleet!")
        }
    }

    // Auth Actions
    fun login(email: String, pass: String, onSuccess: () -> Unit, onError: (String) -> Unit) {
        val result = authRepository.login(email, pass)
        result.onSuccess {
            viewModelScope.launch {
                _snackbarMessage.emit("Welcome back, ${it.name}!")
            }
            onSuccess()
        }.onFailure {
            onError(it.message ?: "Authentication failed")
        }
    }

    fun register(name: String, email: String, pass: String, confirm: String, onSuccess: () -> Unit, onError: (String) -> Unit) {
        val result = authRepository.register(name, email, pass, confirm)
        result.onSuccess {
            viewModelScope.launch {
                _snackbarMessage.emit("Account created for ${it.name}!")
            }
            onSuccess()
        }.onFailure {
            onError(it.message ?: "Registration failed")
        }
    }

    fun loginDemoAdmin(onSuccess: () -> Unit) {
        authRepository.loginAsDemoAdmin()
        viewModelScope.launch {
            _snackbarMessage.emit("Signed in as Collection Director (Alexander Vance)")
        }
        onSuccess()
    }

    fun logout() {
        authRepository.logout()
        viewModelScope.launch {
            _snackbarMessage.emit("Logged out successfully")
        }
        navigateTo(Screen.Login)
    }

    fun clearFilters() {
        searchQuery.value = ""
        selectedBrand.value = null
        selectedFuelType.value = null
        selectedStatus.value = null
        selectedTransmission.value = null
        sortOption.value = SortOption.DATE_ADDED
    }
}
