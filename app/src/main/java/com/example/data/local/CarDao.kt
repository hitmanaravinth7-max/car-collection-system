package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface CarDao {
    @Query("SELECT * FROM cars ORDER BY createdAt DESC")
    fun getAllCars(): Flow<List<CarEntity>>

    @Query("SELECT * FROM cars WHERE id = :id LIMIT 1")
    fun getCarById(id: String): Flow<CarEntity?>

    @Query("SELECT COUNT(*) FROM cars")
    suspend fun getCount(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCar(car: CarEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(cars: List<CarEntity>)

    @Update
    suspend fun updateCar(car: CarEntity)

    @Query("DELETE FROM cars WHERE id = :id")
    suspend fun deleteCarById(id: String)

    @Query("DELETE FROM cars")
    suspend fun deleteAll()
}
