enum PingUnit {
    //% block="cm"
    Centimeters,
}


//% weight=0 color=#00BFFF icon="\uf2c4" block="Qcar"
namespace qcar {
    
    const modeRegister1 = 0x00 // MODE1
    const chipResolution = 4096;
    const modeRegister1Default = 0x01
    const sleep = modeRegister1Default | 0x10; // Set sleep bit to 1
    const wake = modeRegister1Default & 0xEF; // Set sleep bit to 0
    const restart = wake | 0x80; // Set restart bit to 1
    const PrescaleReg = 0xFE //the prescale register address
    const allChannelsOnStepLowByte = 0xFA // ALL_LED_ON_L
    const allChannelsOnStepHighByte = 0xFB // ALL_LED_ON_H
    const allChannelsOffStepLowByte = 0xFC // ALL_LED_OFF_L
    const allChannelsOffStepHighByte = 0xFD // ALL_LED_OFF_H

    function write(register: number, value: number): void {
        const data = (register << 8) & value
        pins.i2cWriteNumber(0x40,data, NumberFormat.Int16BE, false);
    }

    function calcFreqPrescaler(freq: number): number {
        return (25000000 / (freq * chipResolution)) - 1;
    }

    export enum Patrol {
        //% blockId="patrolLeft" block="left"
        PatrolLeft = 2,
        //% blockId="patrolRight" block="right"
        PatrolRight = 1
    }


    export enum irstatus {
        //% blockId="iron" block="on"
        iron = 1,
        //% blockId="iroff" block="off"
        iroff = 2
    }

    export enum Direction {
        //% blockId="Go_Foward" block="Go Foward"
        foward = 1,
        //% blockId="Go_Back" block="Go Back"
        back = 2,
        //% blockId="Turn_Left" block="Turn Left"
        left = 3,
        //% blockId="Turn_Right" block="Turn Right"
        right = 4,
        //% blockId="Stop" block="Stop"
        stop = 5
    }

    /**
     * Read ultrasonic sensor.
     */

    //% blockId=ultrasonic_sensor block="read ultrasonic sensor |%unit "
    //% weight=10
    export function Ultrasonic(unit: PingUnit, maxCmDistance = 500): number {
        let d
        pins.digitalWritePin(DigitalPin.P12, 1);
        basic.pause(1)
        pins.digitalWritePin(DigitalPin.P12, 0);
        if (pins.digitalReadPin(DigitalPin.P13) == 0) {
            pins.digitalWritePin(DigitalPin.P12, 0);
            //sleep_us(2);
            pins.digitalWritePin(DigitalPin.P12, 1);
            //sleep_us(10);
            pins.digitalWritePin(DigitalPin.P12, 0);
            d = pins.pulseIn(DigitalPin.P13, PulseValue.High, maxCmDistance * 58);//readPulseIn(1);
        } else {
            pins.digitalWritePin(DigitalPin.P12, 0);
            pins.digitalWritePin(DigitalPin.P12, 1);
            d = pins.pulseIn(DigitalPin.P13, PulseValue.Low, maxCmDistance * 58);//readPulseIn(0);
        }
        let x = d / 39;
        if (x <= 0 || x > 500) {
            return 0;
        }
        switch (unit) {
            case PingUnit.Centimeters: return Math.round(x);
            default: return Math.idiv(d, 2.54);
        }

    }


     /**
     * Read line tracking sensor.
     */

    //% weight=20
    //% blockId=read_Patrol block="read |%patrol line tracking sensor"
    //% patrol.fieldEditor="gridpicker" patrol.fieldOptions.columns=2 
    export function readPatrol(patrol: Patrol): number {
        if (patrol == Patrol.PatrolLeft) {
            return pins.analogReadPin(AnalogPin.P2)
        } else if (patrol == Patrol.PatrolRight) {
            return pins.analogReadPin(AnalogPin.P1)
        } else {
            return -1
        }
    }


   /**
    * Enable IR LED.
    */

   //% blockId=IR_Enable block="Set the infrared status to |%irstatus"
   //% irstatus.fieldEditor="gridpicker" irstatus.fieldOptions.columns=2 
   //% weight=30 blockGap=8

   export function IREnable(IRstatus: irstatus): void {
       if (IRstatus == irstatus.iron) {
           pins.digitalWritePin(DigitalPin.P14, 1)
       } else if (IRstatus == irstatus.iroff) {
           pins.digitalWritePin(DigitalPin.P14, 0)
       } 
   }

   /**
    * Stop the Q-Car
    */

   //% blockId=Stop_QCar block="Stop the Q-Car"
   //% weight=40 blockGap=8

   export function Stop(): void {

    // Low byte of onStep
    write(0x06, 0 & 0xFF)
    write(0x07, (0 >> 8) & 0x0F)
    write(0x08, 4095 & 0xFF)
    write(0x09, (4095 >> 8) & 0x0F)
        
    write(0x0A, 0 & 0xFF)
    write(0x0B, (0 >> 8) & 0x0F)
    write(0x0C, 4095 & 0xFF)
    write(0x0D, (4095 >> 8) & 0x0F)

    write(0x0E, 0 & 0xFF)
    write(0x0E, (0 >> 8) & 0x0F)
    write(0x10, 4095 & 0xFF)
    write(0x11, (4095 >> 8) & 0x0F)

    write(0x12, 0 & 0xFF)
    write(0x13, (0 >> 8) & 0x0F)
    write(0x14, 4095 & 0xFF)
    write(0x15, (4095 >> 8) & 0x0F)
    } 


   /**
    * Contral The Q-Car.
    */

   //% blockId=Q-Car_Direction block="Let the Q-Car |%Direction"
   //% Direction.fieldEditor="gridpicker" Direction.fieldOptions.columns=5 
   //% weight=50 blockGap=8

   export function QCar_Direction(Car_Direction: Direction): void {
       if (Car_Direction == Direction.foward) {
           write(0x06, 0 & 0xFF)
           write(0x07, (0 >> 8) & 0x0F)
           write(0x08, 4095 & 0xFF)
           write(0x09, (4095 >> 8) & 0x0F)
            
           write(0x0A, 4095 & 0xFF)
           write(0x0B, (4095 >> 8) & 0x0F)
           write(0x0C, 0 & 0xFF)
           write(0x0D, (0 >> 8) & 0x0F)

           write(0x0E, 4095 & 0xFF)
           write(0x0F, (4095 >> 8) & 0x0F)
           write(0x10, 0 & 0xFF)
           write(0x11, (0 >> 8) & 0x0F)

           write(0x12, 0 & 0xFF)
           write(0x13, (0 >> 8) & 0x0F)
           write(0x14, 4095 & 0xFF)
           write(0x15, (4095 >> 8) & 0x0F)
        } 
        else if (Car_Direction == Direction.back) {
            write(0x06, 4095 & 0xFF)
            write(0x07, (4095 >> 8) & 0x0F)
            write(0x08, 0 & 0xFF)
            write(0x09, (0 >> 8) & 0x0F)
            
            write(0x0A, 0 & 0xFF)
            write(0x0B, (0 >> 8) & 0x0F)
            write(0x0C, 4095 & 0xFF)
            write(0x0D, (4095 >> 8) & 0x0F)


            write(0x0E, 0 & 0xFF)
            write(0x0F, (0 >> 8) & 0x0F)
            write(0x10, 4095 & 0xFF)
            write(0x11, (4095 >> 8) & 0x0F)

            write(0x12, 4095 & 0xFF)
            write(0x13, (4095 >> 8) & 0x0F)
            write(0x14, 0 & 0xFF)
            write(0x15, (0  >> 8) & 0x0F)
        } 
        else if (Car_Direction == Direction.left) {

            write(0x06, 0 & 0xFF)
            write(0x07, (0 >> 8) & 0x0F)
            write(0x08, 4095 & 0xFF)
            write(0x09, (4095 >> 8) & 0x0F)
            
            write(0x0A, 4095 & 0xFF)
            write(0x0B, (4095 >> 8) & 0x0F)
            write(0x0C, 0 & 0xFF)
            write(0x0D, (0 >> 8) & 0x0F)


            write(0x0E, 0 & 0xFF)
            write(0x0F, (0 >> 8) & 0x0F)
            write(0x10, 4095 & 0xFF)
            write(0x11, (4095 >> 8) & 0x0F)

            write(0x12, 4095 & 0xFF)
            write(0x13, (4095 >> 8) & 0x0F)
            write(0x14, 0 & 0xFF)
            write(0x15, (0  >> 8) & 0x0F)
        
        } 
        else if (Car_Direction == Direction.right) {

            write(0x06, 4095 & 0xFF)
            write(0x07, (4095 >> 8) & 0x0F)
            write(0x08, 0 & 0xFF)
            write(0x09, (0 >> 8) & 0x0F)
            
            write(0x0A, 0 & 0xFF)
            write(0x0B, (0 >> 8) & 0x0F)
            write(0x0C, 4095 & 0xFF)
            write(0x0D, (4095 >> 8) & 0x0F)


            write(0x0E, 4095 & 0xFF)
            write(0x0F, (4095 >> 8) & 0x0F)
            write(0x10, 0 & 0xFF)
            write(0x11, (0 >> 8) & 0x0F)
    
            write(0x12, 0 & 0xFF)
            write(0x13, (0 >> 8) & 0x0F)
            write(0x14, 4095 & 0xFF)
            write(0x15, (4095 >> 8) & 0x0F)
        } 
        else if (Car_Direction == Direction.stop) {

            // Low byte of onStep
            write(0x06, 0 & 0xFF)
            write(0x07, (0 >> 8) & 0x0F)
            write(0x08, 4095 & 0xFF)
            write(0x09, (4095 >> 8) & 0x0F)
            
            write(0x0A, 0 & 0xFF)
            write(0x0B, (0 >> 8) & 0x0F)
            write(0x0C, 4095 & 0xFF)
            write(0x0D, (4095 >> 8) & 0x0F)
    
            write(0x0E, 0 & 0xFF)
            write(0x0F, (0 >> 8) & 0x0F)
            write(0x10, 4095 & 0xFF)
            write(0x11, (4095 >> 8) & 0x0F)
    
            write(0x12, 0 & 0xFF)
            write(0x13, (0 >> 8) & 0x0F)
            write(0x14, 4095 & 0xFF)
            write(0x15, (4095 >> 8) & 0x0F)
        } 
    }
   /**
    * Used to setup the chip, will cause the chip to do a full reset and turn off all outputs..
    */

   //% blockId=init block="init |%newFreq"
   //% weight=60 blockGap=8
    //% block advanced=true
    export function init(newFreq: number = 50) {
        const freq = (newFreq > 1000 ? 1000 : (newFreq < 40 ? 40 : newFreq))
        const prescaler = calcFreqPrescaler(freq)

        write(modeRegister1, sleep)

        write(PrescaleReg, prescaler)

        write(allChannelsOnStepLowByte, 0x00)
        write(allChannelsOnStepHighByte, 0x00)
        write(allChannelsOffStepLowByte, 0x00)
        write(allChannelsOffStepHighByte, 0x00)

        write(modeRegister1, wake)

        control.waitMicros(1000)
        write(modeRegister1, restart)
    }

}