# AI Architecture

## 1. High-Level Design
The system is composed of the following modules:
*   **[OCR_MODULE]**: Responsible for converting [IMAGE_INPUT] to [TEXT_OUTPUT].
*   **[CLEANER_MODULE]**: Removes [NOISE_PATTERNS] from the raw text.
*   **[ENTITY_EXTRACTOR]**: Identifies [MED_NAME] and [DOSAGE_TAGS].
*   **[PARSER_MODULES]**: Parses [TIMING_INSTRUCTION], [DURATION_STRING], and [DOSAGE_VALUE].
*   **[ESTIMATOR_MODULE]**: Predicts [REFILL_DATE] and [QUANTITY_REQUIRED].
*   **[FORMATTER_MODULE]**: Generates the final [JSON_STRUCTURE].

## 2. Data Flow Pipeline
1.  **Ingestion**: [USER_UPLOAD] -> [IMAGE_PREPROCESSOR]
2.  **Extraction**: [PROCESSED_IMAGE] -> [OCR_ENGINE] -> [RAW_TEXT]
3.  **Refinement**: [RAW_TEXT] -> [TEXT_CLEANER] -> [CLEAN_TEXT]
4.  **Analysis**: [CLEAN_TEXT] -> [NLP_ENGINE] -> [EXTRACTED_ENTITIES]
5.  **Enrichment**: [EXTRACTED_ENTITIES] -> [REFILL_LOGIC] -> [ENRICHED_DATA]
6.  **Output**: [ENRICHED_DATA] -> [JSON_FORMATTER] -> [API_RESPONSE]

## 3. Component Interactions
*   The **[OCR_MODULE]** passes data to the **[CLEANER_MODULE]**.
*   The **[ENTITY_EXTRACTOR]** queries the **[KNOWLEDGE_BASE]** for **[MED_NAME]** validation.
*   The **[ESTIMATOR_MODULE]** uses **[DOSAGE_PATTERN]** and **[DURATION_VALUE]** to compute results.
