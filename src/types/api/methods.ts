export interface Methods {
  "fx:create_client": "POST" | "OPTIONS";
  "fx:client": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:create_user": "POST" | "OPTIONS";
  "fx:user": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:attributes": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:attribute": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:default_store": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:stores": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:store": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:store_version": "GET" | "HEAD" | "OPTIONS";
  "fx:users": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:user_accesses": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:customers": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:carts": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:cart": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:items": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:applied_coupon_codes": "GET" | "POST" | "HEAD" | "DELETE" | "OPTIONS";
  "fx:create_session": "POST" | "OPTIONS";
  "fx:transactions": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "OPTIONS";
  "fx:transaction": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "OPTIONS";
  "fx:customer": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:default_billing_address": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:default_payment_method": "GET" | "PUT" | "HEAD" | "PATCH" | "OPTIONS";
  "fx:default_shipping_address": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:customer_addresses": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:item": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:coupon_details": "GET" | "HEAD" | "OPTIONS";
  "fx:coupon_detail": "GET" | "HEAD" | "OPTIONS";
  "fx:discount_details": "GET" | "HEAD" | "OPTIONS";
  "fx:discount_detail": "GET" | "HEAD" | "OPTIONS";
  "fx:downloadable_purchase": "GET" | "HEAD" | "OPTIONS";
  "fx:shipment": "GET" | "HEAD" | "OPTIONS";
  "fx:item_category": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:item_options": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:item_option": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:payments": "GET" | "HEAD" | "OPTIONS";
  "fx:payment": "GET" | "HEAD" | "OPTIONS";
  "fx:applied_taxes": "GET" | "HEAD" | "OPTIONS";
  "fx:applied_tax": "GET" | "HEAD" | "OPTIONS";
  "fx:custom_fields": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:custom_field": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:discounts": "GET" | "HEAD" | "OPTIONS";
  "fx:discount": "GET" | "HEAD" | "OPTIONS";
  "fx:shipments": "GET" | "HEAD" | "OPTIONS";
  "fx:billing_addresses": "GET" | "HEAD" | "OPTIONS";
  "fx:billing_address": "GET" | "HEAD" | "OPTIONS";
  "fx:subscriptions": "GET" | "PUT" | "HEAD" | "PATCH" | "OPTIONS";
  "fx:subscription": "GET" | "PUT" | "HEAD" | "PATCH" | "OPTIONS";
  "fx:original_transaction": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "OPTIONS";
  "fx:last_transaction": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "OPTIONS";
  "fx:transaction_template": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:subscription_settings": "GET" | "PUT" | "HEAD" | "PATCH" | "OPTIONS";
  "fx:item_categories": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:downloadables": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:admin_email_template": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:customer_email_template": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:email_templates": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:tax_item_categories": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:tax_item_category": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:taxes": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:tax": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:payment_method_sets": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:payment_method_set": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:payment_gateway": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:payment_method_set_hosted_payment_gateways":
    | "GET"
    | "PUT"
    | "POST"
    | "HEAD"
    | "PATCH"
    | "DELETE"
    | "OPTIONS";
  "fx:payment_method_set_hosted_payment_gateway":
    | "GET"
    | "PUT"
    | "HEAD"
    | "PATCH"
    | "DELETE"
    | "OPTIONS";
  "fx:payment_method_set_fraud_protections":
    | "GET"
    | "PUT"
    | "POST"
    | "HEAD"
    | "PATCH"
    | "DELETE"
    | "OPTIONS";
  "fx:payment_method_set_fraud_protection": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:coupons": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:coupon": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:coupon_codes": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:coupon_code": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:coupon_code_transactions": "GET" | "HEAD" | "OPTIONS";
  "fx:coupon_code_transaction": "GET" | "HEAD" | "OPTIONS";
  "fx:coupon_item_categories": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:coupon_item_category": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:template_sets": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:template_set": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:template_config": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:cart_template": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:cart_include_template": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:checkout_template": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:receipt_template": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:email_template": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:language_overrides": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:language_override": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:template_configs": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:cart_templates": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:cart_include_templates": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:checkout_templates": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:receipt_templates": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:error_entries": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:error_entry": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:downloadable": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:payment_gateways": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:hosted_payment_gateways": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:hosted_payment_gateway": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:fraud_protections": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:fraud_protection": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:payment_methods_expiring": "GET" | "HEAD" | "OPTIONS";
  "fx:payment_method_expiring": "GET" | "HEAD" | "OPTIONS";
  "fx:store_shipping_methods": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:store_shipping_method": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:store_shipping_services": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:store_shipping_service": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:integrations": "GET" | "POST" | "HEAD" | "DELETE" | "OPTIONS";
  "fx:integration": "GET" | "HEAD" | "DELETE" | "OPTIONS";
  "fx:native_integrations": "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:native_integration": "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";
  "fx:token": "POST" | "OPTIONS";
  "fx:property_helpers": "GET" | "HEAD" | "OPTIONS";
  "fx:checkout_types": "GET" | "HEAD" | "OPTIONS";
  "fx:customer_password_hash_types": "GET" | "HEAD" | "OPTIONS";
  "fx:default_templates": "GET" | "HEAD" | "OPTIONS";
  "fx:languages": "GET" | "HEAD" | "OPTIONS";
  "fx:language_strings": "GET" | "HEAD" | "OPTIONS";
  "fx:locale_codes": "GET" | "HEAD" | "OPTIONS";
  "fx:shipping_methods": "GET" | "HEAD" | "OPTIONS";
  "fx:shipping_method": "GET" | "HEAD" | "OPTIONS";
  "fx:shipping_services": "GET" | "HEAD" | "OPTIONS";
  "fx:shipping_service": "GET" | "HEAD" | "OPTIONS";
  "fx:shipping_containers": "GET" | "HEAD" | "OPTIONS";
  "fx:shipping_container": "GET" | "HEAD" | "OPTIONS";
  "fx:shipping_drop_types": "GET" | "HEAD" | "OPTIONS";
  "fx:shipping_drop_type": "GET" | "HEAD" | "OPTIONS";
  "fx:shipping_address_types": "GET" | "HEAD" | "OPTIONS";
  "fx:countries": "GET" | "HEAD" | "OPTIONS";
  "fx:regions": "GET" | "HEAD" | "OPTIONS";
  "fx:store_versions": "GET" | "HEAD" | "OPTIONS";
  "fx:timezones": "GET" | "HEAD" | "OPTIONS";
}
