package com.example.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AvailabilityStatus
import com.example.data.model.FuelType
import com.example.ui.theme.ElectricBlue
import com.example.ui.theme.NavyBorder
import com.example.ui.theme.NavyCard
import com.example.ui.theme.Slate400
import com.example.ui.theme.StatusAvailable
import com.example.ui.theme.StatusMaintenance
import com.example.ui.theme.StatusReserved
import com.example.ui.theme.StatusSold

@Composable
fun StatusDonutChart(
    statusDistribution: Map<AvailabilityStatus, Int>,
    totalCars: Int,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = NavyCard),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyBorder))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Inventory Status",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "Fleet distribution by readiness",
                style = MaterialTheme.typography.bodySmall,
                color = Slate400
            )

            Spacer(modifier = Modifier.height(16.dp))

            if (totalCars == 0) {
                Text(
                    text = "No vehicles in inventory",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate400,
                    modifier = Modifier.padding(vertical = 24.dp)
                )
            } else {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Donut Chart Canvas
                    Box(
                        modifier = Modifier.size(120.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Canvas(modifier = Modifier.size(110.dp)) {
                            var startAngle = -90f
                            val strokeWidth = 24f

                            statusDistribution.forEach { (status, count) ->
                                if (count > 0) {
                                    val sweepAngle = (count.toFloat() / totalCars.toFloat()) * 360f
                                    val color = when (status) {
                                        AvailabilityStatus.AVAILABLE -> StatusAvailable
                                        AvailabilityStatus.SOLD -> StatusSold
                                        AvailabilityStatus.RESERVED -> StatusReserved
                                        AvailabilityStatus.MAINTENANCE -> StatusMaintenance
                                    }

                                    drawArc(
                                        color = color,
                                        startAngle = startAngle,
                                        sweepAngle = sweepAngle,
                                        useCenter = false,
                                        style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                                    )
                                    startAngle += sweepAngle
                                }
                            }
                        }

                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "$totalCars",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Total",
                                style = MaterialTheme.typography.labelSmall,
                                color = Slate400
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(20.dp))

                    // Legend Column
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        statusDistribution.forEach { (status, count) ->
                            val color = when (status) {
                                AvailabilityStatus.AVAILABLE -> StatusAvailable
                                AvailabilityStatus.SOLD -> StatusSold
                                AvailabilityStatus.RESERVED -> StatusReserved
                                AvailabilityStatus.MAINTENANCE -> StatusMaintenance
                            }
                            val percentage = if (totalCars > 0) (count * 100) / totalCars else 0

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(10.dp)
                                            .background(color, CircleShape)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = status.displayName,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                                Text(
                                    text = "$count ($percentage%)",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Slate400,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FuelDistributionBarChart(
    fuelDistribution: Map<FuelType, Int>,
    totalCars: Int,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = NavyCard),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyBorder))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Powertrain Breakdown",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "Fuel type and propulsion categories",
                style = MaterialTheme.typography.bodySmall,
                color = Slate400
            )

            Spacer(modifier = Modifier.height(14.dp))

            fuelDistribution.forEach { (fuel, count) ->
                val progress = if (totalCars > 0) count.toFloat() / totalCars.toFloat() else 0f
                val animatedProgress by animateFloatAsState(
                    targetValue = progress,
                    animationSpec = tween(durationMillis = 600),
                    label = "fuel_progress"
                )

                val barColor = when (fuel) {
                    FuelType.ELECTRIC -> Color(0xFF06B6D4) // Cyan
                    FuelType.HYBRID -> Color(0xFF10B981) // Emerald
                    FuelType.PETROL -> Color(0xFFF59E0B) // Amber
                    FuelType.DIESEL -> Color(0xFF8B5CF6) // Purple
                }

                Column(modifier = Modifier.padding(vertical = 4.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = fuel.displayName,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "$count cars",
                            style = MaterialTheme.typography.labelSmall,
                            color = Slate400
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    LinearProgressIndicator(
                        progress = { animatedProgress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp),
                        color = barColor,
                        trackColor = Color(0xFF1E293B),
                        strokeCap = StrokeCap.Round
                    )
                }
            }
        }
    }
}
