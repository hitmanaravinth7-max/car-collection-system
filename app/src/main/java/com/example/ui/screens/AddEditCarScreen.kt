package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.model.AvailabilityStatus
import com.example.data.model.Car
import com.example.data.model.FuelType
import com.example.data.model.TransmissionType
import com.example.ui.theme.ElectricBlue
import com.example.ui.theme.NavyBorder
import com.example.ui.theme.NavyCard
import com.example.ui.theme.NavyDark
import com.example.ui.theme.Slate400
import com.example.ui.theme.StatusSold
import com.example.ui.viewmodel.CarViewModel
import java.util.UUID

val PRESET_CAR_IMAGES = listOf(
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80" to "Porsche GT3",
    "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1200&q=80" to "Ferrari Red",
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80" to "AMG Black",
    "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80" to "Tesla Blue",
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80" to "BMW Green",
    "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80" to "Audi RS6",
    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80" to "Aston Martin",
    "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80" to "Lamborghini",
    "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80" to "Mustang Dark Horse",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80" to "Porsche White"
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AddEditCarScreen(
    carId: String?,
    viewModel: CarViewModel,
    modifier: Modifier = Modifier
) {
    val isEditing = carId != null
    val allCars by viewModel.allCars.collectAsState()
    val existingCar = remember(carId, allCars) {
        if (carId != null) allCars.firstOrNull { it.id == carId } else null
    }

    // Form Fields
    var carIdInput by remember(existingCar) {
        mutableStateOf(existingCar?.id ?: "CAR-${(100..999).random()}")
    }
    var brand by remember(existingCar) { mutableStateOf(existingCar?.brand ?: "") }
    var model by remember(existingCar) { mutableStateOf(existingCar?.model ?: "") }
    var yearText by remember(existingCar) {
        mutableStateOf(existingCar?.manufacturingYear?.toString() ?: "2024")
    }
    var regNumber by remember(existingCar) {
        mutableStateOf(existingCar?.registrationNumber ?: "")
    }
    var fuelType by remember(existingCar) {
        mutableStateOf(existingCar?.fuelType ?: FuelType.PETROL)
    }
    var transmission by remember(existingCar) {
        mutableStateOf(existingCar?.transmissionType ?: TransmissionType.AUTOMATIC)
    }
    var mileageText by remember(existingCar) {
        mutableStateOf(existingCar?.mileage?.toString() ?: "")
    }
    var priceText by remember(existingCar) {
        mutableStateOf(existingCar?.price?.toInt()?.toString() ?: "")
    }
    var color by remember(existingCar) { mutableStateOf(existingCar?.color ?: "Silver") }
    var status by remember(existingCar) {
        mutableStateOf(existingCar?.availabilityStatus ?: AvailabilityStatus.AVAILABLE)
    }
    var imageUrl by remember(existingCar) {
        mutableStateOf(existingCar?.imageUrl ?: PRESET_CAR_IMAGES.first().first)
    }
    var horsepowerText by remember(existingCar) {
        mutableStateOf(existingCar?.horsepower?.takeIf { it > 0 }?.toString() ?: "450")
    }
    var description by remember(existingCar) {
        mutableStateOf(existingCar?.description ?: "")
    }

    var validationError by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(NavyDark)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .padding(bottom = 80.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { viewModel.navigateBack() }) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Slate400)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = if (isEditing) "EDIT VEHICLE DETAILS" else "ADD NEW VEHICLE",
                    style = MaterialTheme.typography.labelSmall,
                    color = ElectricBlue,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Text(
                    text = if (isEditing) "${existingCar?.brand} ${existingCar?.model}" else "New Inventory Entry",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Image Preview and Preset Selector
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = NavyCard),
            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyBorder))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "VEHICLE IMAGE",
                    style = MaterialTheme.typography.labelSmall,
                    color = ElectricBlue,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(10.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF0F172A))
                ) {
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = "Car Preview",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Select from Preset HD Photos:",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate400
                )
                Spacer(modifier = Modifier.height(8.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(PRESET_CAR_IMAGES) { (url, label) ->
                        val isSelected = imageUrl == url
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .clickable { imageUrl = url },
                            color = if (isSelected) ElectricBlue else Color(0xFF0F172A),
                            border = CardDefaults.outlinedCardBorder().copy(
                                brush = androidx.compose.ui.graphics.SolidColor(if (isSelected) ElectricBlue else NavyBorder)
                            )
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                if (isSelected) {
                                    Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                }
                                Text(
                                    text = label,
                                    color = if (isSelected) Color.White else Slate400,
                                    style = MaterialTheme.typography.labelSmall
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = imageUrl,
                    onValueChange = { imageUrl = it },
                    label = { Text("Or Custom Image URL") },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("car_image_url_input"),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ElectricBlue,
                        unfocusedBorderColor = NavyBorder,
                        focusedContainerColor = NavyDark,
                        unfocusedContainerColor = NavyDark
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Validation Error Banner
        if (validationError != null) {
            Surface(
                color = StatusSold.copy(alpha = 0.15f),
                shape = RoundedCornerShape(8.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(StatusSold.copy(alpha = 0.4f))),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = validationError ?: "",
                    color = StatusSold,
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(12.dp)
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Form Fields
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = NavyCard),
            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyBorder))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "SPECIFICATIONS & DETAILS",
                    style = MaterialTheme.typography.labelSmall,
                    color = ElectricBlue,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(14.dp))

                // Brand & Model
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = brand,
                        onValueChange = { brand = it; validationError = null },
                        label = { Text("Brand *") },
                        placeholder = { Text("e.g. Porsche") },
                        singleLine = true,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("car_brand_input"),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ElectricBlue,
                            unfocusedBorderColor = NavyBorder,
                            focusedContainerColor = NavyDark,
                            unfocusedContainerColor = NavyDark
                        )
                    )

                    OutlinedTextField(
                        value = model,
                        onValueChange = { model = it; validationError = null },
                        label = { Text("Model *") },
                        placeholder = { Text("e.g. 911 GT3") },
                        singleLine = true,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("car_model_input"),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ElectricBlue,
                            unfocusedBorderColor = NavyBorder,
                            focusedContainerColor = NavyDark,
                            unfocusedContainerColor = NavyDark
                        )
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Year & Registration Number
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = yearText,
                        onValueChange = { yearText = it; validationError = null },
                        label = { Text("Year *") },
                        placeholder = { Text("2024") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("car_year_input"),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ElectricBlue,
                            unfocusedBorderColor = NavyBorder,
                            focusedContainerColor = NavyDark,
                            unfocusedContainerColor = NavyDark
                        )
                    )

                    OutlinedTextField(
                        value = regNumber,
                        onValueChange = { regNumber = it; validationError = null },
                        label = { Text("Reg Number *") },
                        placeholder = { Text("e.g. GT3-992") },
                        singleLine = true,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("car_reg_input"),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ElectricBlue,
                            unfocusedBorderColor = NavyBorder,
                            focusedContainerColor = NavyDark,
                            unfocusedContainerColor = NavyDark
                        )
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Price & Mileage
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = priceText,
                        onValueChange = { priceText = it; validationError = null },
                        label = { Text("Price ($) *") },
                        placeholder = { Text("150000") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("car_price_input"),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ElectricBlue,
                            unfocusedBorderColor = NavyBorder,
                            focusedContainerColor = NavyDark,
                            unfocusedContainerColor = NavyDark
                        )
                    )

                    OutlinedTextField(
                        value = mileageText,
                        onValueChange = { mileageText = it; validationError = null },
                        label = { Text("Mileage (mi) *") },
                        placeholder = { Text("5000") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("car_mileage_input"),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ElectricBlue,
                            unfocusedBorderColor = NavyBorder,
                            focusedContainerColor = NavyDark,
                            unfocusedContainerColor = NavyDark
                        )
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Color & Horsepower
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = color,
                        onValueChange = { color = it },
                        label = { Text("Color") },
                        placeholder = { Text("Shark Blue") },
                        singleLine = true,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("car_color_input"),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ElectricBlue,
                            unfocusedBorderColor = NavyBorder,
                            focusedContainerColor = NavyDark,
                            unfocusedContainerColor = NavyDark
                        )
                    )

                    OutlinedTextField(
                        value = horsepowerText,
                        onValueChange = { horsepowerText = it },
                        label = { Text("Horsepower (HP)") },
                        placeholder = { Text("500") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("car_hp_input"),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ElectricBlue,
                            unfocusedBorderColor = NavyBorder,
                            focusedContainerColor = NavyDark,
                            unfocusedContainerColor = NavyDark
                        )
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Fuel Type Selection Chips
                Text(
                    text = "FUEL TYPE",
                    style = MaterialTheme.typography.labelSmall,
                    color = Slate400,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(6.dp))
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FuelType.entries.forEach { f ->
                        FilterChip(
                            selected = fuelType == f,
                            onClick = { fuelType = f },
                            label = { Text(f.displayName) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = ElectricBlue,
                                selectedLabelColor = Color.White,
                                containerColor = NavyDark,
                                labelColor = Slate400
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Transmission Selection Chips
                Text(
                    text = "TRANSMISSION",
                    style = MaterialTheme.typography.labelSmall,
                    color = Slate400,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(6.dp))
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    TransmissionType.entries.forEach { t ->
                        FilterChip(
                            selected = transmission == t,
                            onClick = { transmission = t },
                            label = { Text(t.displayName) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = ElectricBlue,
                                selectedLabelColor = Color.White,
                                containerColor = NavyDark,
                                labelColor = Slate400
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Availability Status Selection Chips
                Text(
                    text = "AVAILABILITY STATUS",
                    style = MaterialTheme.typography.labelSmall,
                    color = Slate400,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(6.dp))
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    AvailabilityStatus.entries.forEach { s ->
                        FilterChip(
                            selected = status == s,
                            onClick = { status = s },
                            label = { Text(s.displayName) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = ElectricBlue,
                                selectedLabelColor = Color.White,
                                containerColor = NavyDark,
                                labelColor = Slate400
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Description Field
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description & Options") },
                    placeholder = { Text("Add key package specs, transmission gear ratios, or history notes...") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(100.dp)
                        .testTag("car_description_input"),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ElectricBlue,
                        unfocusedBorderColor = NavyBorder,
                        focusedContainerColor = NavyDark,
                        unfocusedContainerColor = NavyDark
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Save & Cancel Buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OutlinedButton(
                onClick = { viewModel.navigateBack() },
                modifier = Modifier
                    .weight(1f)
                    .height(50.dp)
                    .testTag("cancel_car_btn"),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Cancel")
            }

            Button(
                onClick = {
                    // Validation
                    val cleanBrand = brand.trim()
                    val cleanModel = model.trim()
                    val cleanReg = regNumber.trim()
                    val year = yearText.trim().toIntOrNull()
                    val price = priceText.trim().toDoubleOrNull()
                    val mileage = mileageText.trim().toIntOrNull()
                    val hp = horsepowerText.trim().toIntOrNull() ?: 0

                    if (cleanBrand.isEmpty()) {
                        validationError = "Vehicle brand is required."
                        return@Button
                    }
                    if (cleanModel.isEmpty()) {
                        validationError = "Vehicle model is required."
                        return@Button
                    }
                    if (year == null || year < 1900 || year > 2030) {
                        validationError = "Please enter a valid manufacturing year between 1900 and 2030."
                        return@Button
                    }
                    if (cleanReg.isEmpty()) {
                        validationError = "Registration number is required."
                        return@Button
                    }
                    if (price == null || price <= 0) {
                        validationError = "Please enter a valid price greater than $0."
                        return@Button
                    }
                    if (mileage == null || mileage < 0) {
                        validationError = "Please enter a valid mileage."
                        return@Button
                    }

                    val carToSave = Car(
                        id = existingCar?.id ?: carIdInput.ifBlank { "CAR-${UUID.randomUUID().toString().take(6).uppercase()}" },
                        brand = cleanBrand,
                        model = cleanModel,
                        manufacturingYear = year,
                        registrationNumber = cleanReg,
                        fuelType = fuelType,
                        transmissionType = transmission,
                        mileage = mileage,
                        price = price,
                        color = color.trim().ifEmpty { "Silver" },
                        availabilityStatus = status,
                        imageUrl = imageUrl.trim().ifEmpty { PRESET_CAR_IMAGES.first().first },
                        description = description.trim(),
                        horsepower = hp,
                        createdAt = existingCar?.createdAt ?: System.currentTimeMillis()
                    )

                    viewModel.saveCar(carToSave, isEditing)
                },
                modifier = Modifier
                    .weight(1f)
                    .height(50.dp)
                    .testTag("save_car_btn"),
                colors = ButtonDefaults.buttonColors(containerColor = ElectricBlue),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = if (isEditing) "Save Changes" else "Add to Fleet",
                    fontWeight = FontWeight.Bold,
                    style = MaterialTheme.typography.titleMedium
                )
            }
        }
    }
}
