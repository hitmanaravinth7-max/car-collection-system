package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.TableRows
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Car
import com.example.ui.components.CarCard
import com.example.ui.components.FilterSortSheet
import com.example.ui.components.StatusBadge
import com.example.ui.navigation.Screen
import com.example.ui.theme.ElectricBlue
import com.example.ui.theme.NavyBorder
import com.example.ui.theme.NavyCard
import com.example.ui.theme.NavyDark
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate600
import com.example.ui.viewmodel.CarViewModel
import java.text.NumberFormat
import java.util.Locale

@Composable
fun CarListScreen(
    viewModel: CarViewModel,
    modifier: Modifier = Modifier
) {
    val cars by viewModel.filteredCars.collectAsState()
    val allCars by viewModel.allCars.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val selectedBrand by viewModel.selectedBrand.collectAsState()
    val selectedFuel by viewModel.selectedFuelType.collectAsState()
    val selectedStatus by viewModel.selectedStatus.collectAsState()
    val sortOption by viewModel.sortOption.collectAsState()

    var showFilterSheet by remember { mutableStateOf(false) }
    var isTableView by remember { mutableStateOf(false) }

    val hasActiveFilters = selectedBrand != null || selectedFuel != null || selectedStatus != null

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(NavyDark)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .padding(bottom = 80.dp)
        ) {
            // Header Row: Count & Actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "FLEET INVENTORY",
                        style = MaterialTheme.typography.labelSmall,
                        color = ElectricBlue,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "All Vehicles (${cars.size} of ${allCars.size})",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = { isTableView = !isTableView },
                        modifier = Modifier.testTag("toggle_view_mode_btn")
                    ) {
                        Icon(
                            imageVector = if (isTableView) Icons.Default.GridView else Icons.Default.TableRows,
                            contentDescription = "Switch View",
                            tint = Slate400
                        )
                    }

                    Button(
                        onClick = { viewModel.navigateTo(Screen.AddCar) },
                        colors = ButtonDefaults.buttonColors(containerColor = ElectricBlue),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.testTag("inventory_add_btn")
                    ) {
                        Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add Car", style = MaterialTheme.typography.labelMedium)
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Search Bar & Filter Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { viewModel.searchQuery.value = it },
                    placeholder = { Text("Search brand, model, reg, color...", color = Slate400, fontSize = 14.sp) },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.Search, contentDescription = null, tint = Slate400)
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { viewModel.searchQuery.value = "" }) {
                                Icon(imageVector = Icons.Default.Clear, contentDescription = "Clear", tint = Slate400)
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ElectricBlue,
                        unfocusedBorderColor = NavyBorder,
                        focusedContainerColor = NavyCard,
                        unfocusedContainerColor = NavyCard
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("search_car_input")
                )

                // Filter & Sort Trigger Button
                BadgedBox(
                    badge = {
                        if (hasActiveFilters) {
                            Badge(containerColor = ElectricBlue)
                        }
                    }
                ) {
                    IconButton(
                        onClick = { showFilterSheet = true },
                        modifier = Modifier
                            .background(NavyCard, RoundedCornerShape(12.dp))
                            .size(52.dp)
                            .testTag("filter_sort_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.FilterList,
                            contentDescription = "Filter",
                            tint = if (hasActiveFilters) ElectricBlue else Slate400
                        )
                    }
                }
            }

            // Active Filter Pill Indicators
            if (hasActiveFilters || searchQuery.isNotEmpty()) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Filtered by: ${listOfNotNull(selectedBrand, selectedFuel?.displayName, selectedStatus?.displayName).joinToString(", ")}",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400,
                        maxLines = 1
                    )
                    Text(
                        text = "Clear",
                        color = ElectricBlue,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .clickable { viewModel.clearFilters() }
                            .padding(4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Car List or Table View
            if (cars.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.DirectionsCar,
                            contentDescription = null,
                            tint = Slate600,
                            modifier = Modifier.size(64.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "No vehicles found",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = if (searchQuery.isNotEmpty() || hasActiveFilters)
                                "Try adjusting your search query or reset active filters."
                            else
                                "Your showroom fleet is empty. Add your first vehicle!",
                            style = MaterialTheme.typography.bodySmall,
                            color = Slate400
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        if (searchQuery.isNotEmpty() || hasActiveFilters) {
                            Button(
                                onClick = { viewModel.clearFilters() },
                                colors = ButtonDefaults.buttonColors(containerColor = ElectricBlue)
                            ) {
                                Text("Reset Filters")
                            }
                        } else {
                            Button(
                                onClick = { viewModel.navigateTo(Screen.AddCar) },
                                colors = ButtonDefaults.buttonColors(containerColor = ElectricBlue)
                            ) {
                                Text("Add First Car")
                            }
                        }
                    }
                }
            } else if (isTableView) {
                // Compact Table View
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(cars, key = { it.id }) { car ->
                        CarTableRow(
                            car = car,
                            onViewClick = { viewModel.navigateTo(Screen.CarDetails(car.id)) },
                            onEditClick = { viewModel.navigateTo(Screen.EditCar(car.id)) },
                            onDeleteClick = { viewModel.carToDelete.value = car }
                        )
                    }
                }
            } else {
                // Card View
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(cars, key = { it.id }) { car ->
                        CarCard(
                            car = car,
                            onViewClick = { viewModel.navigateTo(Screen.CarDetails(car.id)) },
                            onEditClick = { viewModel.navigateTo(Screen.EditCar(car.id)) },
                            onDeleteClick = { viewModel.carToDelete.value = car }
                        )
                    }
                }
            }
        }

        if (showFilterSheet) {
            FilterSortSheet(
                viewModel = viewModel,
                onDismiss = { showFilterSheet = false }
            )
        }
    }
}

@Composable
fun CarTableRow(
    car: Car,
    onViewClick: () -> Unit,
    onEditClick: () -> Unit,
    onDeleteClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val currencyFormat = NumberFormat.getCurrencyInstance(Locale.US).apply {
        maximumFractionDigits = 0
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onViewClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = NavyCard),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyBorder))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "${car.brand} ${car.model}",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "(${car.manufacturingYear})",
                        style = MaterialTheme.typography.bodySmall,
                        color = Slate400
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = car.registrationNumber,
                        style = MaterialTheme.typography.labelSmall,
                        color = ElectricBlue
                    )
                    Text(
                        text = "• ${car.fuelType.displayName}",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400
                    )
                    Text(
                        text = "• ${String.format("%,d", car.mileage)} mi",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = currencyFormat.format(car.price),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFF38BDF8)
                )
                Spacer(modifier = Modifier.height(4.dp))
                StatusBadge(status = car.availabilityStatus)
            }
        }
    }
}
