package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.model.AvailabilityStatus
import com.example.data.model.FuelType
import com.example.data.model.TransmissionType
import com.example.data.repository.AuthRepository
import com.example.data.repository.CarRepository
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ExampleRobolectricTest {

    @Test
    fun `read string from context matches app_name`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val appName = context.getString(R.string.app_name)
        assertEquals("Car Collection", appName)
    }

    @Test
    fun `initial sample fleet contains valid vehicles and specs`() {
        val sampleCars = CarRepository.getInitialSampleCars()
        assertTrue(sampleCars.size >= 10)
        assertTrue(sampleCars.any { it.brand == "Porsche" })
        assertTrue(sampleCars.any { it.availabilityStatus == AvailabilityStatus.AVAILABLE })
        assertTrue(sampleCars.any { it.fuelType == FuelType.ELECTRIC })
    }

    @Test
    fun `auth repository validates login credentials`() {
        val authRepo = AuthRepository()
        val success = authRepo.login("admin@carcollection.com", "password123")
        assertTrue(success.isSuccess)
        assertNotNull(authRepo.currentUser.value)
        assertEquals("Alexander Vance", authRepo.currentUser.value?.name)

        val failed = authRepo.login("admin@carcollection.com", "wrongpassword")
        assertTrue(failed.isFailure)
    }
}
