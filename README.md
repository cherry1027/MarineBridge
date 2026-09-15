# MarineBridge — Universal Marine IoT Gateway

MarineBridge is a small, frontend-only thesis demonstrator exploring a Volvo Penta–relevant problem: marine systems combine established vessel protocols with newer IoT transports, leaving applications to handle incompatible device interfaces.

The prototype represents each device through a standardized entity abstraction (`Light`, `TemperatureSensor`, or `DoorSensor`). Applications issue one common command through `POST /api/device/{id}/state`; a protocol adapter translates it into a synthetic J1939, NMEA 2000, Zigbee, or BLE message.

The open-source reuse panel provides a preliminary comparison of MQTT, Home Assistant Core, Node-RED, and a custom adapter layer as potential implementation building blocks.

## Run locally

```bash
npm run dev
```

## Limitation

All devices, protocol messages, state changes, and results are simulated in the browser. The prototype has no backend, persistence, real hardware, or live vessel-network integration.
