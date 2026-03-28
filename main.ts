//% weight=100 color=#0fbc11 icon=""
namespace BME280 {
    let addr = 0x77

    let dig_T1: number
    let dig_T2: number
    let dig_T3: number
    let dig_P1: number
    let dig_P2: number
    let dig_P3: number
    let dig_P4: number
    let dig_P5: number
    let dig_P6: number
    let dig_P7: number
    let dig_P8: number
    let dig_P9: number
    let dig_H1: number
    let dig_H2: number
    let dig_H3: number
    let dig_H4: number
    let dig_H5: number
    let dig_H6: number
    let t_fine: number

    function readReg(reg: number, len: number): Buffer {
        let buf = pins.createBuffer(1)
        buf[0] = reg
        pins.i2cWriteBuffer(addr, buf, false)
        return pins.i2cReadBuffer(addr, len, false)
    }

    function int16(msb: number, lsb: number): number {
        let val = (msb << 8) | lsb
        if (val > 32767) val -= 65536
        return val
    }

    function uint16(msb: number, lsb: number): number {
        return (msb << 8) | lsb
    }

    //% block="set I2C address %address"
    //% address.defl=0x77
    export function setAddress(address: number) {
        addr = address
    }

    //% block="initialize BME280"
    export function inicializar() {
        // Activar humedad
        let hum = pins.createBuffer(2)
        hum[0] = 0xF2
        hum[1] = 0x01
        pins.i2cWriteBuffer(addr, hum, false)

        // Modo normal
        let ctrl = pins.createBuffer(2)
        ctrl[0] = 0xF4
        ctrl[1] = 0x27
        pins.i2cWriteBuffer(addr, ctrl, false)

        basic.pause(300)

        // Leer coeficientes de calibración
        let cal1 = readReg(0x88, 24)
        let cal2 = readReg(0xA1, 1)
        let cal3 = readReg(0xE1, 7)

        dig_T1 = uint16(cal1[1], cal1[0])
        dig_T2 = int16(cal1[3], cal1[2])
        dig_T3 = int16(cal1[5], cal1[4])
        dig_P1 = uint16(cal1[7], cal1[6])
        dig_P2 = int16(cal1[9], cal1[8])
        dig_P3 = int16(cal1[11], cal1[10])
        dig_P4 = int16(cal1[13], cal1[12])
        dig_P5 = int16(cal1[15], cal1[14])
        dig_P6 = int16(cal1[17], cal1[16])
        dig_P7 = int16(cal1[19], cal1[18])
        dig_P8 = int16(cal1[21], cal1[20])
        dig_P9 = int16(cal1[23], cal1[22])
        dig_H1 = cal2[0]
        dig_H2 = int16(cal3[1], cal3[0])
        dig_H3 = cal3[2]
        dig_H4 = (cal3[3] << 4) | (cal3[4] & 0x0F)
        dig_H5 = (cal3[5] << 4) | (cal3[4] >> 4)
        dig_H6 = cal3[6]
        if (dig_H4 > 2047) dig_H4 -= 4096
        if (dig_H5 > 2047) dig_H5 -= 4096
        if (dig_H6 > 127) dig_H6 -= 256
    //% blockId=bme280_poweroff block="power off BME280" blockHidden=false
    export function powerOff() {
        let ctrl = pins.createBuffer(2)
        ctrl[0] = 0xF4
        ctrl[1] = 0x00  // Sleep mode
        pins.i2cWriteBuffer(addr, ctrl, false)
    }

    //% blockId=bme280_temperature block="temperature (°C)" blockHidden=false
    export function temperature(): number {
        let raw = readReg(0xF7, 8)
        let rawT = ((raw[3] << 12) | (raw[4] << 4) | (raw[5] >> 4))
        let var1 = (rawT / 16384 - dig_T1 / 1024) * dig_T2
        let var2 = (rawT / 131072 - dig_T1 / 8192) * (rawT / 131072 - dig_T1 / 8192) * dig_T3
        t_fine = var1 + var2
        let temp = t_fine / 5120
        return Math.round(temp)
    }

    //% blockId=bme280_humidity block="humidity (%)" blockHidden=false
    export function humidity(): number {
        let raw = readReg(0xF7, 8)
        let rawH = ((raw[6] << 8) | raw[7])
        let h = t_fine - 76800
        h = (rawH - (dig_H4 * 64 + dig_H5 / 16384 * h)) *
            (dig_H2 / 65536 * (1 + dig_H6 / 67108864 * h *
            (1 + dig_H3 / 67108864 * h)))
        h = h * (1 - dig_H1 * h / 524288)
        if (h > 100) h = 100
        if (h < 0) h = 0
        return Math.round(h)
    }

    //% blockId=bme280_pressure block="pressure (hPa)" blockHidden=false
    export function pressure(): number {
        let raw = readReg(0xF7, 8)
        let rawP = ((raw[0] << 12) | (raw[1] << 4) | (raw[2] >> 4))
        let var1 = (t_fine / 2) - 64000
        let var2 = var1 * var1 * dig_P6 / 32768
        var2 = var2 + var1 * dig_P5 * 2
        var2 = (var2 / 4) + (dig_P4 * 65536)
        var1 = (dig_P3 * var1 * var1 / 524288 + dig_P2 * var1) / 524288
        var1 = (1 + var1 / 32768) * dig_P1
        let p = 1048576 - rawP
        p = (p - (var2 / 4096)) * 6250 / var1
        var1 = dig_P9 * p * p / 2147483648
        var2 = p * dig_P8 / 32768
        p = p + (var1 + var2 + dig_P7) / 16
        return Math.round(p / 100)
    }
}