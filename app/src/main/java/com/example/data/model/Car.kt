package com.example.data.model

data class Car(
    val id: String,
    val brand: String,
    val model: String,
    val manufacturingYear: Int,
    val registrationNumber: String,
    val fuelType: FuelType,
    val transmissionType: TransmissionType,
    val mileage: Int,
    val price: Double,
    val color: String,
    val availabilityStatus: AvailabilityStatus,
    val imageUrl: String,
    val description: String = "",
    val horsepower: Int = 0,
    val createdAt: Long = System.currentTimeMillis()
)
