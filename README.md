# BME280 Extension for micro:bit

This extension allows using the BME280 sensor to measure temperature, humidity, and atmospheric pressure with the micro:bit.

## Usage

1. Add the extension in MakeCode by pasting the repository URL.
2. Set the I2C address if necessary (default 0x77).
3. Initialize the sensor at the start of the program.
4. Use the blocks to read temperature, humidity, and pressure.

### Example

```
on start:
    BME280 set I2C address 0x76
    BME280 initialize BME280

forever:
    show number BME280 temperature (°C)
    pause 2000ms
    show number BME280 humidity (%)
    pause 2000ms
    show number BME280 pressure (hPa)
    pause 2000ms
```

## Available Blocks

- **set I2C address**: Configure the sensor's I2C address (0x76 or 0x77).
- **initialize BME280**: Prepare the sensor for readings.
- **temperature (°C)**: Get the temperature.
- **humidity (%)**: Get the relative humidity.
- **pressure (hPa)**: Get the atmospheric pressure.
- **power off BME280**: Put the sensor in sleep mode to save energy.

## Connection

Connect the BME280 to the I2C connector of the Keystudio Sensor Shield V2:
- VCC to 3.3V
- GND to GND
- SCL to SCL (Pin 19)
- SDA to SDA (Pin 20)

The I2C address depends on the module; check with an I2C scan if necessary.