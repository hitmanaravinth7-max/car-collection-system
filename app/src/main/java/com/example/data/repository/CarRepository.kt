package com.example.data.repository

import com.example.data.local.CarDao
import com.example.data.local.CarEntity
import com.example.data.model.AvailabilityStatus
import com.example.data.model.Car
import com.example.data.model.FuelType
import com.example.data.model.TransmissionType
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class CarRepository(private val carDao: CarDao) {

    val allCars: Flow<List<Car>> = carDao.getAllCars().map { entities ->
        entities.map { it.toCar() }
    }

    fun getCarById(id: String): Flow<Car?> {
        return carDao.getCarById(id).map { it?.toCar() }
    }

    suspend fun insertCar(car: Car) {
        carDao.insertCar(CarEntity.fromCar(car))
    }

    suspend fun updateCar(car: Car) {
        carDao.updateCar(CarEntity.fromCar(car))
    }

    suspend fun deleteCar(id: String) {
        carDao.deleteCarById(id)
    }

    suspend fun ensureSampleDataLoaded() {
        val count = carDao.getCount()
        if (count == 0) {
            val sampleEntities = getInitialSampleCars().map { CarEntity.fromCar(it) }
            carDao.insertAll(sampleEntities)
        }
    }

    suspend fun resetToSampleData() {
        carDao.deleteAll()
        val sampleEntities = getInitialSampleCars().map { CarEntity.fromCar(it) }
        carDao.insertAll(sampleEntities)
    }

    companion object {
        fun getInitialSampleCars(): List<Car> {
            return listOf(
                Car(
                    id = "CAR-001",
                    brand = "Porsche",
                    model = "911 GT3 RS",
                    manufacturingYear = 2024,
                    registrationNumber = "GT3-992-RS",
                    fuelType = FuelType.PETROL,
                    transmissionType = TransmissionType.DUAL_CLUTCH,
                    mileage = 1850,
                    price = 285000.0,
                    color = "Shark Blue",
                    availabilityStatus = AvailabilityStatus.AVAILABLE,
                    imageUrl = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80",
                    description = "Naturally aspirated 4.0-liter flat-six engine revving to 9,000 RPM with carbon fiber aero pack and Weissach Package.",
                    horsepower = 518,
                    createdAt = System.currentTimeMillis() - 86400000L * 1
                ),
                Car(
                    id = "CAR-002",
                    brand = "Ferrari",
                    model = "296 GTB",
                    manufacturingYear = 2023,
                    registrationNumber = "FR-296-IT",
                    fuelType = FuelType.HYBRID,
                    transmissionType = TransmissionType.DUAL_CLUTCH,
                    mileage = 3400,
                    price = 345000.0,
                    color = "Rosso Corsa",
                    availabilityStatus = AvailabilityStatus.AVAILABLE,
                    imageUrl = "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1200&q=80",
                    description = "Twin-turbo 120-degree V6 plug-in hybrid producing thrilling acoustic harmony and phenomenal track agility.",
                    horsepower = 819,
                    createdAt = System.currentTimeMillis() - 86400000L * 3
                ),
                Car(
                    id = "CAR-003",
                    brand = "Mercedes-AMG",
                    model = "GT Black Series",
                    manufacturingYear = 2022,
                    registrationNumber = "AMG-BLK-01",
                    fuelType = FuelType.PETROL,
                    transmissionType = TransmissionType.DUAL_CLUTCH,
                    mileage = 2200,
                    price = 385000.0,
                    color = "Magmabeam Orange",
                    availabilityStatus = AvailabilityStatus.SOLD,
                    imageUrl = "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
                    description = "Flat-plane crank 4.0L biturbo V8, extreme active aerodynamics and carbon ceramic braking system.",
                    horsepower = 720,
                    createdAt = System.currentTimeMillis() - 86400000L * 5
                ),
                Car(
                    id = "CAR-004",
                    brand = "Tesla",
                    model = "Model S Plaid",
                    manufacturingYear = 2024,
                    registrationNumber = "TSLA-PLD-X",
                    fuelType = FuelType.ELECTRIC,
                    transmissionType = TransmissionType.AUTOMATIC,
                    mileage = 4500,
                    price = 112000.0,
                    color = "Deep Blue Metallic",
                    availabilityStatus = AvailabilityStatus.AVAILABLE,
                    imageUrl = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80",
                    description = "Tri-motor all-wheel drive with carbon-sleeved rotors, achieving 0-60 mph in 1.99 seconds.",
                    horsepower = 1020,
                    createdAt = System.currentTimeMillis() - 86400000L * 7
                ),
                Car(
                    id = "CAR-005",
                    brand = "BMW",
                    model = "M4 Competition xDrive",
                    manufacturingYear = 2023,
                    registrationNumber = "BM-M4-COMP",
                    fuelType = FuelType.PETROL,
                    transmissionType = TransmissionType.AUTOMATIC,
                    mileage = 9200,
                    price = 98000.0,
                    color = "Isle of Man Green",
                    availabilityStatus = AvailabilityStatus.RESERVED,
                    imageUrl = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
                    description = "S58 3.0L twin-power turbo inline-six engine with M xDrive all-wheel performance and carbon bucket seats.",
                    horsepower = 503,
                    createdAt = System.currentTimeMillis() - 86400000L * 10
                ),
                Car(
                    id = "CAR-006",
                    brand = "Audi",
                    model = "RS6 Avant Performance",
                    manufacturingYear = 2024,
                    registrationNumber = "AUDI-RS6-DE",
                    fuelType = FuelType.PETROL,
                    transmissionType = TransmissionType.AUTOMATIC,
                    mileage = 5600,
                    price = 142000.0,
                    color = "Nardo Gray",
                    availabilityStatus = AvailabilityStatus.AVAILABLE,
                    imageUrl = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80",
                    description = "Ultimate high-performance super wagon with 4.0L twin-turbo V8, quattro sport differential and dynamic air suspension.",
                    horsepower = 621,
                    createdAt = System.currentTimeMillis() - 86400000L * 12
                ),
                Car(
                    id = "CAR-007",
                    brand = "Aston Martin",
                    model = "DBS Superleggera",
                    manufacturingYear = 2023,
                    registrationNumber = "AM-DBS-007",
                    fuelType = FuelType.PETROL,
                    transmissionType = TransmissionType.AUTOMATIC,
                    mileage = 4100,
                    price = 310000.0,
                    color = "Onyx Black",
                    availabilityStatus = AvailabilityStatus.SOLD,
                    imageUrl = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
                    description = "Grand tourer flagship featuring a ferocious 5.2L twin-turbocharged V12 with British luxury bespoke cockpit.",
                    horsepower = 715,
                    createdAt = System.currentTimeMillis() - 86400000L * 15
                ),
                Car(
                    id = "CAR-008",
                    brand = "Lamborghini",
                    model = "Huracán Tecnica",
                    manufacturingYear = 2023,
                    registrationNumber = "LAM-HUR-TC",
                    fuelType = FuelType.PETROL,
                    transmissionType = TransmissionType.DUAL_CLUTCH,
                    mileage = 3100,
                    price = 278000.0,
                    color = "Verde Selvans",
                    availabilityStatus = AvailabilityStatus.AVAILABLE,
                    imageUrl = "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80",
                    description = "Glorious 5.2L V10 rear-wheel drive bridge between road usability and race track performance.",
                    horsepower = 631,
                    createdAt = System.currentTimeMillis() - 86400000L * 18
                ),
                Car(
                    id = "CAR-009",
                    brand = "Ford",
                    model = "Mustang Dark Horse",
                    manufacturingYear = 2024,
                    registrationNumber = "MUS-DKH-US",
                    fuelType = FuelType.PETROL,
                    transmissionType = TransmissionType.MANUAL,
                    mileage = 1500,
                    price = 65000.0,
                    color = "Blue Ember",
                    availabilityStatus = AvailabilityStatus.MAINTENANCE,
                    imageUrl = "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80",
                    description = "5.0-liter Coyote V8 with Tremec 6-speed manual transmission, MagneRide damping, and 3D-printed titanium shift ball.",
                    horsepower = 500,
                    createdAt = System.currentTimeMillis() - 86400000L * 22
                ),
                Car(
                    id = "CAR-010",
                    brand = "Lucid",
                    model = "Air Sapphire",
                    manufacturingYear = 2024,
                    registrationNumber = "LCD-SAP-99",
                    fuelType = FuelType.ELECTRIC,
                    transmissionType = TransmissionType.AUTOMATIC,
                    mileage = 2900,
                    price = 249000.0,
                    color = "Sapphire Blue",
                    availabilityStatus = AvailabilityStatus.AVAILABLE,
                    imageUrl = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
                    description = "World's first luxury electric super-sports sedan with three-motor powertrain delivering sub-2-second acceleration.",
                    horsepower = 1234,
                    createdAt = System.currentTimeMillis() - 86400000L * 25
                )
            )
        }
    }
}
