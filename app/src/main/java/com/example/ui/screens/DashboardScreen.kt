package com.example.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Collections
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.Sell
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.data.model.AvailabilityStatus
import com.example.ui.components.CarCard
import com.example.ui.components.FuelDistributionBarChart
import com.example.ui.components.StatCard
import com.example.ui.components.StatusDonutChart
import com.example.ui.navigation.Screen
import com.example.ui.theme.ElectricBlue
import com.example.ui.theme.GoldAccent
import com.example.ui.theme.NavyBorder
import com.example.ui.theme.NavyCard
import com.example.ui.theme.NavyDark
import com.example.ui.theme.Slate400
import com.example.ui.theme.StatusAvailable
import com.example.ui.theme.StatusAvailableBg
import com.example.ui.theme.StatusSold
import com.example.ui.theme.StatusSoldBg
import com.example.ui.viewmodel.CarViewModel
import java.text.NumberFormat
import java.util.Locale

@Composable
fun DashboardScreen(
    viewModel: CarViewModel,
    modifier: Modifier = Modifier
) {
    val stats by viewModel.dashboardStats.collectAsState()
    val currentUser by viewModel.currentUser.collectAsState()

    val currencyFormat = NumberFormat.getCurrencyInstance(Locale.US).apply {
        maximumFractionDigits = 0
    }
    val formattedTotalValue = currencyFormat.format(stats.totalValue)

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(NavyDark)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .padding(bottom = 80.dp)
    ) {
        // Welcome Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Welcome back, ${currentUser?.name ?: "Director"}",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "${currentUser?.role ?: "Collection Director"} • Live Fleet Telemetry",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate400
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Hero Showroom Banner Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = NavyCard),
            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyBorder))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
            ) {
                // Try rendering the generated showroom hero image, fallback gracefully
                Image(
                    painter = painterResource(id = R.drawable.img_hero_car_1791813083127),
                    contentDescription = "Showroom Supercar",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                // Dark gradient overlay
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            androidx.compose.ui.graphics.Brush.verticalGradient(
                                colors = listOf(Color.Transparent, Color(0xDD0B1325), Color(0xFF0B1325))
                            )
                        )
                )

                Column(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(16.dp)
                ) {
                    Text(
                        text = "PRESTIGE COLLECTION",
                        style = MaterialTheme.typography.labelSmall,
                        color = ElectricBlue,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "Executive Dealership Inventory",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = { viewModel.navigateTo(Screen.AddCar) },
                            colors = ButtonDefaults.buttonColors(containerColor = ElectricBlue),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.testTag("hero_add_car_btn")
                        ) {
                            Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Add Vehicle", style = MaterialTheme.typography.labelMedium)
                        }
                        OutlinedButton(
                            onClick = { viewModel.navigateTo(Screen.Gallery) },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                            modifier = Modifier.testTag("hero_view_gallery_btn")
                        ) {
                            Icon(imageVector = Icons.Default.Collections, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Showroom Gallery", style = MaterialTheme.typography.labelMedium)
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // 4 Primary Metric Stat Cards
        Text(
            text = "FLEET METRICS",
            style = MaterialTheme.typography.labelSmall,
            color = ElectricBlue,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard(
                title = "Total Fleet",
                value = "${stats.totalCars}",
                subtitle = "Active in system",
                icon = Icons.Default.DirectionsCar,
                iconColor = ElectricBlue,
                iconBackground = ElectricBlue.copy(alpha = 0.15f),
                modifier = Modifier.weight(1f)
            )
            StatCard(
                title = "Available",
                value = "${stats.availableCars}",
                subtitle = "Ready for delivery",
                icon = Icons.Default.CheckCircle,
                iconColor = StatusAvailable,
                iconBackground = StatusAvailableBg,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard(
                title = "Sold Units",
                value = "${stats.soldCars}",
                subtitle = "Closed acquisitions",
                icon = Icons.Default.Sell,
                iconColor = StatusSold,
                iconBackground = StatusSoldBg,
                modifier = Modifier.weight(1f)
            )
            StatCard(
                title = "Total Value",
                value = formattedTotalValue,
                subtitle = "Asset valuation",
                icon = Icons.Default.AttachMoney,
                iconColor = GoldAccent,
                iconBackground = GoldAccent.copy(alpha = 0.15f),
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Charts Section
        Text(
            text = "ANALYTICS & BREAKDOWN",
            style = MaterialTheme.typography.labelSmall,
            color = ElectricBlue,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(10.dp))

        StatusDonutChart(
            statusDistribution = stats.statusDistribution,
            totalCars = stats.totalCars
        )

        Spacer(modifier = Modifier.height(16.dp))

        FuelDistributionBarChart(
            fuelDistribution = stats.fuelDistribution,
            totalCars = stats.totalCars
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Recently Added Cars Section
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "RECENTLY ADDED VEHICLES",
                    style = MaterialTheme.typography.labelSmall,
                    color = ElectricBlue,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "Latest additions to the dealership",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate400
                )
            }
            TextButton(
                onClick = { viewModel.navigateTo(Screen.ViewAllCars) },
                modifier = Modifier.testTag("dashboard_view_all_link")
            ) {
                Text("View All (${stats.totalCars})", color = ElectricBlue, fontWeight = FontWeight.Bold)
                Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp), tint = ElectricBlue)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (stats.recentCars.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 32.dp),
                contentAlignment = Alignment.Center
            ) {
                Text("No recent cars found", color = Slate400)
            }
        } else {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(stats.recentCars, key = { it.id }) { car ->
                    Box(modifier = Modifier.width(300.dp)) {
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
    }
}
