"use strict";

const API_ENDPOINTS = require("../../apiEndpoints");

class SoqlUrl {

    /**
        * Escapes single quotes for SoQL and ensures value is a string.
        */
    static escapeSoqlString(val) {
        if (val === undefined || val === null) return "";
        return String(val).replace(/'/g, "''");
    }

    /**
         * Constructs a SoQL query URL.
         *
         * @param {Object} queryParams - Query parameters for the dataset.
         * @param {string} apiCaller - The name of the API caller.
         * @param {string|Array<string>|null} selectOption - The `$select` option.
         * @param {number} [limit] - The `$limit` parameter for pagination.
         * @param {number} [offset] - The `$offset` parameter for pagination.
         * @returns {string} - Constructed SoQL query URL.
         */
    static constructUrl(queryParams, apiCaller, selectOption = "records", limit, offset) {
        if (typeof queryParams !== "object" || queryParams === null) {
            throw new Error("'constructUrl' received invalid 'queryParams' parameter: Expected an object.");
        }

        if (!apiCaller || typeof apiCaller !== "string") {
            throw new Error("'constructUrl' received invalid 'apiCaller' parameter: Expected a non-empty string.");
        }

        const apiEndpoint = this.setApiEndpointConfig(apiCaller);
        if (!apiEndpoint) {
            throw new Error(`'constructUrl' received unknown 'apiCaller' parameter: ${apiCaller}`);
        }

        const conditions = this.setConditionsConfig(queryParams, apiCaller);
        const selectClause = this.setSelectConfig(selectOption);
        const whereClause = this.setWhereConfig(conditions);
        const limitOffsetClause = this.setLimitOffsetConfig(selectOption, limit, offset);

        const clauses = [selectClause, whereClause, limitOffsetClause].filter(Boolean).join("&");
        const url = `${apiEndpoint}?${clauses}`;
        // ADD THIS LOG:
        console.log("DEBUG: Final constructed SoQL URL:", url);
        return url;
    }

    /**
     * Constructs a SoQL query URL to fetch full records for an array of document_id values.
     * @param {Object} queryParams - Additional query parameters.
     * @param {string} apiCaller - The name of the API caller.
     * @param {Array<string>} documentIds - Array of document_id values.
     * @param {number} [limit] - Optional limit.
     * @param {number} [offset] - Optional offset.
     * @returns {string} - Constructed SoQL query URL.
     */
    static constructUrlForDocumentIds(queryParams, apiCaller, documentIds, limit, offset) {
        if (!Array.isArray(documentIds) || documentIds.length === 0) {
            throw new Error("'constructUrlForDocumentIds' requires a non-empty array of documentIds.");
        }
        const conditions = this.setConditionsConfig(queryParams, apiCaller);
        conditions.push(`document_id IN (${documentIds.map(id => `'${this.escapeSoqlString(id)}'`).join(", ")})`);
        const selectClause = this.setSelectConfig("records");
        const whereClause = this.setWhereConfig(conditions);
        const limitOffsetClause = this.setLimitOffsetConfig("records", limit, offset);
        const apiEndpoint = this.setApiEndpointConfig(apiCaller);
        const clauses = [selectClause, whereClause, limitOffsetClause].filter(Boolean).join("&");
        const url = `${apiEndpoint}?${clauses}`;
        return url;
    }

    /**
     * Constructs SoQL query URLs in batches.
     *
     * @param {Object} queryParams - Query parameters for the dataset. Possible values: `masterQueryParams`, `partiesQueryParams`, `legalsQueryParams`, `remarksQueryParams`, `referencesQueryParams`.
     * @param {Array<string>} documentIdsCrossRef - Array of document IDs to cross-reference. Possible values: `masterRecordsDocumentIds`, `partiesRecordsDocumentIds`, `legalsRecordsDocumentIds`, `referencesRecordsDocumentIds`, `remarksRecordsDocumentIds`.
     * @param {string} apiCaller - The name of the API caller. Possible values: `PartiesRealPropApi`, `MasterRealPropApi`, `LegalsRealPropApi`, `ReferencesRealPropApi`, `RemarksRealPropApi`.
     * @param {number} batchSize - Number of document IDs per batch.
     * @returns {Array<string>} - Array of constructed query URLs.
     * 
     * 
     */
    static constructUrlBatches(queryParams, documentIdsCrossRef, apiCaller, batchSize = 500) {
        if (!Array.isArray(documentIdsCrossRef)) {
            throw new Error("'constructUrlBatches' received invalid 'documentIdsCrossRef' parameter: Expected an array.");
        }
        if (typeof batchSize !== "number" || batchSize <= 0) {
            throw new Error("'constructUrlBatches' received invalid 'batchSize' parameter: Expected a positive number.");
        }

        const baseUrl = this.constructUrl(queryParams, apiCaller, "document_id");
        const batches = [];

        for (let i = 0; i < documentIdsCrossRef.length; i += batchSize) {
            const batch = documentIdsCrossRef.slice(i, i + batchSize);
            const documentIdsCondition = `document_id IN (${batch.map(id => `'${this.escapeSoqlString(id)}'`).join(", ")})`;
            const separator = baseUrl.includes("$where=") ? " AND " : "$where=";
            batches.push(`${baseUrl}${separator}${documentIdsCondition}`);
        }

        return batches;
    }

    /**
     * Sets the conditions for the query based on the API caller.
     *
     * @param {Object} queryParams - Query parameters for the dataset.
     * @param {string} apiCaller - The name of the API caller (e.g., "PartiesRealPropApi").
     * @returns {Array<string>} - Array of conditions.
     */
    static setConditionsConfig(queryParams, apiCaller) {
        if (!apiCaller || typeof apiCaller !== "string") {
            throw new Error("'setConditionsConfig' received invalid 'apiCaller' parameter: Expected a non-empty string.");
        }

        const escape = this.escapeSoqlString;
        const conditions = [];

        // Add this block for all relevant APIs:
        if (queryParams.transaction_number) {
            // Use LIKE for prefix match
            conditions.push(`document_id LIKE '${escape(queryParams.transaction_number)}%'`);
        }

        //Real Property API query params
        if (apiCaller === "PartiesRealPropApi") {
            if (queryParams.document_id) conditions.push(`document_id='${escape(queryParams.document_id)}'`);
            if (queryParams.record_type) conditions.push(`record_type='${escape(queryParams.record_type)}'`);
            if (queryParams.party_type) conditions.push(`party_type='${escape(queryParams.party_type)}'`);
            if (queryParams.name) conditions.push(`name like '%${escape(queryParams.name)}%'`);
            if (queryParams.address_1) conditions.push(`address_1='${escape(queryParams.address_1)}'`);
            if (queryParams.address_2) conditions.push(`address_2='${escape(queryParams.address_2)}'`);
            if (queryParams.country) conditions.push(`country='${escape(queryParams.country)}'`);
            if (queryParams.city) conditions.push(`city='${escape(queryParams.city)}'`);
            if (queryParams.state) conditions.push(`state='${escape(queryParams.state)}'`);
            if (queryParams.zip) conditions.push(`zip='${escape(queryParams.zip)}'`);
            if (queryParams.good_through_date) conditions.push(`good_through_date='${escape(queryParams.good_through_date)}'`);
        } else if (apiCaller === "MasterRealPropApi") {
            if (queryParams.document_id) conditions.push(`document_id='${escape(queryParams.document_id)}'`);
            if (queryParams.crfn) conditions.push(`crfn='${escape(queryParams.crfn)}'`);
            if (queryParams.recorded_borough) conditions.push(`recorded_borough='${escape(queryParams.recorded_borough)}'`);
            if (queryParams.doc_type) {
                const docTypes = Array.isArray(queryParams.doc_type)
                    ? queryParams.doc_type
                    : queryParams.doc_type.split(",");
                console.log("DEBUG: doc_type array for doc_class", queryParams.doc_class, docTypes);
                conditions.push(
                    `doc_type IN (${docTypes.map(type => `'${escape(type.trim())}'`).join(", ")})`
                );
            }
            if (queryParams.document_date_start && queryParams.document_date_end) {
                conditions.push(`document_date between '${escape(queryParams.document_date_start)}' and '${escape(queryParams.document_date_end)}'`);
            }
            if (queryParams.recorded_date_start && queryParams.recorded_date_end) {
                conditions.push(`recorded_datetime between '${escape(queryParams.recorded_date_start)}' and '${escape(queryParams.recorded_date_end)}'`);
            }
            if (queryParams.modified_date_start && queryParams.modified_date_end) {
                conditions.push(`modified_date between '${escape(queryParams.modified_date_start)}' and '${escape(queryParams.modified_date_end)}'`);
            }
            if (queryParams.good_through_date_start && queryParams.good_through_date_end) {
                conditions.push(`good_through_date between '${escape(queryParams.good_through_date_start)}' and '${escape(queryParams.good_through_date_end)}'`);
            }
            if (queryParams.document_amt) conditions.push(`document_amt='${escape(queryParams.document_amt)}'`);
            if (queryParams.reel_yr) conditions.push(`reel_yr='${escape(queryParams.reel_yr)}'`);
            if (queryParams.reel_nbr) conditions.push(`reel_nbr='${escape(queryParams.reel_nbr)}'`);
            if (queryParams.reel_pg) conditions.push(`reel_pg='${escape(queryParams.reel_pg)}'`);
            if (queryParams.percent_trans) conditions.push(`percent_trans='${escape(queryParams.percent_trans)}'`);
        } else if (apiCaller === "LegalsRealPropApi") {
            if (queryParams.document_id) conditions.push(`document_id='${escape(queryParams.document_id)}'`);
            if (queryParams.record_type) conditions.push(`record_type='${escape(queryParams.record_type)}'`);
            if (queryParams.borough) conditions.push(`borough=${escape(queryParams.borough)}`);
            if (queryParams.block) conditions.push(`block=${escape(queryParams.block)}`);
            if (queryParams.lot) conditions.push(`lot=${escape(queryParams.lot)}`);
            if (queryParams.easement) conditions.push(`easement='${escape(queryParams.easement)}'`);
            if (queryParams.partial_lot) conditions.push(`partial_lot='${escape(queryParams.partial_lot)}'`);
            if (queryParams.air_rights) conditions.push(`air_rights='${escape(queryParams.air_rights)}'`);
            if (queryParams.subterranean_rights) conditions.push(`subterranean_rights='${escape(queryParams.subterranean_rights)}'`);
            if (queryParams.property_type) conditions.push(`property_type='${escape(queryParams.property_type)}'`);
            if (queryParams.street_number) conditions.push(`street_number='${escape(queryParams.street_number)}'`);
            if (queryParams.street_name) conditions.push(`street_name='${escape(queryParams.street_name)}'`);
            if (queryParams.unit) conditions.push(`unit='${escape(queryParams.unit)}'`);
            if (queryParams.good_through_date) conditions.push(`good_through_date='${escape(queryParams.good_through_date)}'`);
        } else if (apiCaller === "ReferencesRealPropApi") {
            if (queryParams.document_id) conditions.push(`document_id='${escape(queryParams.document_id)}'`);
            if (queryParams.record_type) conditions.push(`record_type='${escape(queryParams.record_type)}'`);
            if (queryParams.reference_by_crfn_) conditions.push(`reference_by_crfn_='${escape(queryParams.reference_by_crfn_)}'`);
            if (queryParams.reference_by_doc_id) conditions.push(`reference_by_doc_id='${escape(queryParams.reference_by_doc_id)}'`);
            if (queryParams.reference_by_reel_year) conditions.push(`reference_by_reel_year='${escape(queryParams.reference_by_reel_year)}'`);
            if (queryParams.reference_by_reel_borough) conditions.push(`reference_by_reel_borough='${escape(queryParams.reference_by_reel_borough)}'`);
            if (queryParams.reference_by_reel_nbr) conditions.push(`reference_by_reel_nbr='${escape(queryParams.reference_by_reel_nbr)}'`);
            if (queryParams.reference_by_reel_page) conditions.push(`reference_by_reel_page='${escape(queryParams.reference_by_reel_page)}'`);
            if (queryParams.good_through_date) conditions.push(`good_through_date='${escape(queryParams.good_through_date)}'`);
        } else if (apiCaller === "RemarksRealPropApi") {
            if (queryParams.document_id) conditions.push(`document_id='${escape(queryParams.document_id)}'`);
            if (queryParams.record_type) conditions.push(`record_type='${escape(queryParams.record_type)}'`);
            if (queryParams.sequence_number) conditions.push(`sequence_number='${escape(queryParams.sequence_number)}'`);
            if (queryParams.remark_text) conditions.push(`remark_text='${escape(queryParams.remark_text)}'`);
            if (queryParams.good_through_date) conditions.push(`good_through_date='${escape(queryParams.good_through_date)}'`);
        }

        // Personal Property API query params
        if (apiCaller === "MasterPersPropApi") {
            if (queryParams.document_id) conditions.push(`document_id='${escape(queryParams.document_id)}'`);
            if (queryParams.record_type) conditions.push(`record_type='${escape(queryParams.record_type)}'`);
            if (queryParams.crfn) conditions.push(`crfn='${escape(queryParams.crfn)}'`);
            if (queryParams.recorded_borough) conditions.push(`recorded_borough='${escape(queryParams.recorded_borough)}'`);
            if (queryParams.doc_type) conditions.push(`doc_type='${escape(queryParams.doc_type)}'`);
            if (queryParams.document_amt) conditions.push(`document_amt='${escape(queryParams.document_amt)}'`);
            if (queryParams.recorded_datetime) conditions.push(`recorded_datetime='${escape(queryParams.recorded_datetime)}'`);
            if (queryParams.ucc_collateral) conditions.push(`ucc_collateral='${escape(queryParams.ucc_collateral)}'`);
            if (queryParams.fedtax_serial_nbr) conditions.push(`fedtax_serial_nbr='${escape(queryParams.fedtax_serial_nbr)}'`);
            if (queryParams.fedtax_assessment_date) conditions.push(`fedtax_assessment_date='${escape(queryParams.fedtax_assessment_date)}'`);
            if (queryParams.rpttl_nbr) conditions.push(`rpttl_nbr='${escape(queryParams.rpttl_nbr)}'`);
            if (queryParams.modified_date) conditions.push(`modified_date='${escape(queryParams.modified_date)}'`);
            if (queryParams.reel_yr) conditions.push(`reel_yr='${escape(queryParams.reel_yr)}'`);
            if (queryParams.reel_nbr) conditions.push(`reel_nbr='${escape(queryParams.reel_nbr)}'`);
            if (queryParams.reel_pg) conditions.push(`reel_pg='${escape(queryParams.reel_pg)}'`);
            if (queryParams.file_nbr) conditions.push(`file_nbr='${escape(queryParams.file_nbr)}'`);
            if (queryParams.good_through_date) conditions.push(`good_through_date='${escape(queryParams.good_through_date)}'`);
            if (queryParams.ucc_lien_file_number) conditions.push(`file_nbr='${escape(queryParams.ucc_lien_file_number)}'`);
        } else if (apiCaller === "LegalsPersPropApi") {
            if (queryParams.document_id) conditions.push(`document_id='${escape(queryParams.document_id)}'`);
            if (queryParams.record_type) conditions.push(`record_type='${escape(queryParams.record_type)}'`);
            if (queryParams.borough) conditions.push(`borough=${escape(queryParams.borough)}`);
            if (queryParams.block) conditions.push(`block=${escape(queryParams.block)}`);
            if (queryParams.lot) conditions.push(`lot=${escape(queryParams.lot)}`);
            if (queryParams.easement) conditions.push(`easement='${escape(queryParams.easement)}'`);
            if (queryParams.partial_lot) conditions.push(`partial_lot='${escape(queryParams.partial_lot)}'`);
            if (queryParams.air_rights) conditions.push(`air_rights='${escape(queryParams.air_rights)}'`);
            if (queryParams.subterranean_rights) conditions.push(`subterranean_rights='${escape(queryParams.subterranean_rights)}'`);
            if (queryParams.property_type) conditions.push(`property_type='${escape(queryParams.property_type)}'`);
            if (queryParams.street_number) conditions.push(`street_number='${escape(queryParams.street_number)}'`);
            if (queryParams.street_name) conditions.push(`street_name='${escape(queryParams.street_name)}'`);
            if (queryParams.unit) conditions.push(`unit='${escape(queryParams.unit)}'`);
            if (queryParams.good_through_date) conditions.push(`good_through_date='${escape(queryParams.good_through_date)}'`);
        } else if (apiCaller === "PartiesPersPropApi") {
            if (queryParams.document_id) conditions.push(`document_id='${escape(queryParams.document_id)}'`);
            if (queryParams.record_type) conditions.push(`record_type='${escape(queryParams.record_type)}'`);
            if (queryParams.party_type) conditions.push(`party_type='${escape(queryParams.party_type)}'`);
            if (queryParams.name) conditions.push(`name like '%${escape(queryParams.name)}%'`);
            if (queryParams.address_1) conditions.push(`address_1='${escape(queryParams.address_1)}'`);
            if (queryParams.address_2) conditions.push(`address_2='${escape(queryParams.address_2)}'`);
            if (queryParams.country) conditions.push(`country='${escape(queryParams.country)}'`);
            if (queryParams.city) conditions.push(`city='${escape(queryParams.city)}'`);
            if (queryParams.state) conditions.push(`state='${escape(queryParams.state)}'`);
            if (queryParams.zip) conditions.push(`zip='${escape(queryParams.zip)}'`);
            if (queryParams.good_through_date) conditions.push(`good_through_date='${escape(queryParams.good_through_date)}'`);
        } else if (apiCaller === "ReferencesPersPropApi") {
            if (queryParams.document_id) conditions.push(`document_id='${escape(queryParams.document_id)}'`);
            if (queryParams.record_type) conditions.push(`record_type='${escape(queryParams.record_type)}'`);
            if (queryParams.crfn) conditions.push(`crfn='${escape(queryParams.crfn)}'`);
            if (queryParams.doc_id_ref) conditions.push(`doc_id_ref='${escape(queryParams.doc_id_ref)}'`);
            if (queryParams.file_nbr) conditions.push(`file_nbr='${escape(queryParams.file_nbr)}'`);
            if (queryParams.good_through_date) conditions.push(`good_through_date='${escape(queryParams.good_through_date)}'`);
        } else if (apiCaller === "RemarksPersPropApi") {
            if (queryParams.document_id) conditions.push(`document_id='${escape(queryParams.document_id)}'`);
            if (queryParams.record_type) conditions.push(`record_type='${escape(queryParams.record_type)}'`);
            if (queryParams.sequence_number) conditions.push(`sequence_number='${escape(queryParams.sequence_number)}'`);
            if (queryParams.remark_text) conditions.push(`remark_text='${escape(queryParams.remark_text)}'`);
            if (queryParams.good_through_date) conditions.push(`good_through_date='${escape(queryParams.good_through_date)}'`);
        }


        return conditions;
    }

    /**
     * Sets the `$select` clause for the query.
     *
     * @param {string|Array<string>|null} selectOption - The `$select` option. Possible values:
     * - `"records"` (default): Includes all records that match the query parameters without adding a `$select` clause.
     * - `"document_id"`: Adds `$select=document_id` to retrieve only `document_id` values.
     * - `"countAll"`: Adds `$select=count(*)` to retrieve the count of matching records.
     * - An array of strings (e.g., `["document_id", "party_type"]`): Adds `$select` with the specified fields (e.g., `$select=document_id,party_type`).
     * @returns {string} - The `$select` clause or an empty string if `selectOption` is `"records"`.
     */
    static setSelectConfig(selectOption = "records") {
        if (selectOption === "records") {
            return ""; // No `$select` clause for "records" (default behavior)
        }

        if (selectOption === "countAll") {
            return `$select=count(*)`;
        }

        if (selectOption === "document_id") {
            return `$select=document_id`;
        }

        if (Array.isArray(selectOption)) {
            const fields = selectOption.join(",");
            return `$select=${fields}`;
        }

        throw new Error(`'setSelectConfig' received invalid 'selectOption' parameter: ${selectOption}`);
    }

    /**
     * Sets the `$where` clause for the query.
     *
     * @param {Array<string>} conditions - Array of conditions.
     * @returns {string} - The `$where` clause.
     * 
     */
    static setWhereConfig(conditions) {
        if (conditions.length > 0) {
            return `$where=${encodeURIComponent(conditions.join(" AND "))}`;
        }
        return "";
    }

    /**
     * Determines the API endpoint based on the API caller.
     *
     * @param {string} apiCaller - The name of the API caller (e.g., "PartiesRealPropApi").
     * @returns {string} - The API endpoint.
     */
    static setApiEndpointConfig(apiCaller) {
        const endpointMap = {
            // Real Property
            PartiesRealPropApi: API_ENDPOINTS.realPropertyParties,
            MasterRealPropApi: API_ENDPOINTS.realPropertyMaster,
            LegalsRealPropApi: API_ENDPOINTS.realPropertyLegals,
            ReferencesRealPropApi: API_ENDPOINTS.realPropertyReferences,
            RemarksRealPropApi: API_ENDPOINTS.realPropertyRemarks,
            // Personal Property
            PartiesPersPropApi: API_ENDPOINTS.personalPropertyParties,
            MasterPersPropApi: API_ENDPOINTS.personalPropertyMaster,
            LegalsPersPropApi: API_ENDPOINTS.personalPropertyLegals,
            ReferencesPersPropApi: API_ENDPOINTS.personalPropertyReferences,
            RemarksPersPropApi: API_ENDPOINTS.personalPropertyRemarks,
        };

        const endpoint = endpointMap[apiCaller];
        if (!endpoint) {
            throw new Error(`'setApiEndpointConfig' received unknown 'apiCaller' parameter: ${apiCaller}`);
        }

        return endpoint;
    }

    /**
     * Sets the `$limit` and `$offset` clauses for pagination.
     *
     * @param {string|Array<string>|null} selectOption - The `$select` option.
     * @param {number} [limit] - The `$limit` parameter for pagination.
     * @param {number} [offset] - The `$offset` parameter for pagination.
     * @returns {string} - The `$limit` and `$offset` clauses.
     */
    static setLimitOffsetConfig(selectOption, limit, offset) {
        if (selectOption === "countAll") {
            return ""; // No need for limit/offset when counting records.
        }

        const clauses = [];
        if (limit) clauses.push(`$limit=${limit}`);
        if (offset) clauses.push(`$offset=${offset}`);
        return clauses.join("&");
    }

}

module.exports = SoqlUrl;