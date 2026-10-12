package com.example.data.model

enum class FuelType(val displayName: String) {
    PETROL("Petrol"),
    DIESEL("Diesel"),
    ELECTRIC("Electric"),
    HYBRID("Hybrid");

    companion object {
        fun fromString(value: String): FuelType {
            return entries.firstOrNull { it.name.equals(value, ignoreCase = true) || it.displayName.equals(value, ignoreCase = true) } ?: PETROL
        }
    }
}

enum class TransmissionType(val displayName: String) {
    AUTOMATIC("Automatic"),
    MANUAL("Manual"),
    DUAL_CLUTCH("Dual-Clutch");

    companion object {
        fun fromString(value: String): TransmissionType {
            return entries.firstOrNull { it.name.equals(value, ignoreCase = true) || it.displayName.equals(value, ignoreCase = true) } ?: AUTOMATIC
        }
    }
}

enum class AvailabilityStatus(val displayName: String) {
    AVAILABLE("Available"),
    SOLD("Sold"),
    RESERVED("Reserved"),
    MAINTENANCE("In Maintenance");

    companion object {
        fun fromString(value: String): AvailabilityStatus {
            return entries.firstOrNull { it.name.equals(value, ignoreCase = true) || it.displayName.equals(value, ignoreCase = true) } ?: AVAILABLE
        }
    }
}
