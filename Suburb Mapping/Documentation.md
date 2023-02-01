Suburb Mapping Documention
==========================
This document describes the process of mapping suburbs to postcodes as well as Driver Information (Primary and Secondary Drivers).

Suburb Mapping Workflow
=======================

Suburb Mapping
1. Suburb Mapping Client Script
    mp_cl_suburb_mapping.js
2. Suburb Mapping Suitelet Script
    mp_sl_suburb_mapping.js
3. Suburb Mapping Scheduled Script
    mp_ss_suburb_mapping.js

Export Suburb Mapping
1. Export Suburb Mapping Client Script
    mp_cl_export_suburb_mapping.js
2. Export Suburb Mapping Suitelet Script
    mp_sl_export_suburb_mapping.js
3. Export Suburb Mapping Scheduled Script
    mp_ss_export_suburb_mapping.js

Suburb Mapping Client Script
----------------------------
Stores data directly to "custentity_network_matrix_json" and "custentity_sendle_recovery_suburbs" custom fields on the under operations tab of franchisee record.

Suburb Mapping Suitelet Script
------------------------------
This page is used to map suburbs to postcodes. It also allows the user to add driver information (Primary and Secondary Drivers) to the suburb mapping.

Export Mapping Scheduled Script
-------------------------------
Used to generate large csv export of all suburbs and postcodes used for MP Standard, MP Express or Sendle.

