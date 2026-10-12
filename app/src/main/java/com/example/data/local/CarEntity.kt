package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.data.model.AvailabilityStatus
import com.example.data.model.Car
import com.example.data.model.FuelType
import com.example.data.model.TransmissionType

@Entity(tableName = "cars")
data class CarEntity(
    @PrimaryKey
    val id: String,
    val brand: String,
    val model: String,
    val manufacturingYear: Int,
    val registrationNumber: String,
    val fuelType: String,
    val transmissionType: String,
    val mileage: Int,
    val price: Double,
    val color: String,
    val availabilityStatus: String,
    val imageUrl: String,
    val description: String,
    val horsepower: Int,
    val createdAt: Long
) {
    fun toCar(): Car {
        return Car(
            id = id,
            brand = brand,
            model = model,
            manufacturingYear = manufacturingYear,
            registrationNumber = registrationNumber,
            fuelType = FuelType.fromString(fuelType),
            transmissionType = TransmissionType.fromString(transmissionType),
            mileage = mileage,
            price = price,
            color = color,
            availabilityStatus = AvailabilityStatus.fromString(availabilityStatus),
            imageUrl = imageUrl,
            description = description,
            horsepower = horsepower,
            createdAt = createdAt
        )
    }

    companion object {
        fun fromCar(car: Car): CarEntity {
            return CarEntity(
                id = car.id,
                brand = car.brand,
                model = car.model,
                manufacturingYear = car.manufacturingYear,
                registrationNumber = car.registrationNumber,
                fuelType = car.fuelType.name,
                transmissionType = car.transmissionType.name,
                mileage = car.mileage,
                price = car.price,
                color = car.color,
                availabilityStatus = car.availabilityStatus.name,
                imageUrl = car.imageUrl,
                description = car.description,
                horsepower = car.horsepower,
                createdAt = car.createdAt
            )
        }
    }
}
