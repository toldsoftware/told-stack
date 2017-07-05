# Lookup Long Short Cache

- Use Lookup File for CDN Control
    - Lookup File is Cheap to Regenerate and can have a short TTL
- Actual Content Files Have Long CDN Life with Permanently Unique Names

## Lookup with Long-Short Cache TTL

- CDN Lookup File Until Stale Timeout (~ 1 min)
- On Expire, Client CDN Request Will Hit Server
- ASAP Respond with the Old Lookup File with a Short TTL (Poll Time ~ 5 sec)
    - Queue an update request (async if possible)
    - This will prevent many clients hitting the server simultaneously
    - Clients Continue to Get Old Data for 5 sec from CDN, while new data is obtained
- Process Update Request 
- Update Lookup File with new Path and Stale TTL