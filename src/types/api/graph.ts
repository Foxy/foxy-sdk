interface PropertyHelper {
  "self": PropertyHelper;
  "fx:property_helpers": PropertyHelpers;
}

interface DefaultTemplates extends PropertyHelper {
  "self": DefaultTemplates;
  "fx:cart_templates": IndexedCollection<Template>;
  "fx:checkout_templates": IndexedCollection<Template>;
  "fx:receipt_templates": IndexedCollection<Template>;
  "fx:email_templates": IndexedCollection<Template>;
}

interface Collection {
  self: Collection;
  first: Collection;
  prev: Collection;
  next: Collection;
  last: Collection;
}

interface IndexedCollection<T> extends Collection {
  [key: number]: T;
}

interface ShippingService {
  "self": ShippingService;
  "fx:shipping_method": ShippingMethod;
  "fx:shipping_methods": IndexedCollection<ShippingMethod>;
  "fx:property_helpers": PropertyHelpers;
}

interface ShippingContainer {
  "self": ShippingContainer;
  "fx:shipping_containers": IndexedCollection<ShippingContainer>;
  "fx:shipping_methods": IndexedCollection<ShippingMethod>;
  "fx:shipping_method": ShippingMethod;
  "fx:property_helpers": PropertyHelpers;
}

interface ShippingDropType {
  "self": ShippingDropType;
  "fx:shipping_drop_types": IndexedCollection<ShippingDropType>;
  "fx:shipping_methods": IndexedCollection<ShippingMethod>;
  "fx:shipping_method": ShippingMethod;
  "fx:property_helpers": PropertyHelpers;
}

interface ShippingMethod extends PropertyHelper {
  "self": ShippingMethod;
  "fx:shipping_methods": IndexedCollection<ShippingMethod>;
  "fx:shipping_services": IndexedCollection<ShippingService>;
  "fx:shipping_containers": IndexedCollection<ShippingContainer>;
  "fx:shipping_drop_types": IndexedCollection<ShippingDropType>;
}

interface Regions extends PropertyHelper {
  "self": Regions;
  "fx:countries": PropertyHelper;
}

interface StoreVersion extends PropertyHelper {
  "self": StoreVersion;
  "fx:store_versions": IndexedCollection<StoreVersion>;
}

interface PropertyHelpers {
  "self": PropertyHelpers;
  "fx:hosted_payment_gateways": PropertyHelper;
  "fx:checkout_types": PropertyHelper;
  "fx:customer_password_hash_types": PropertyHelper;
  "fx:default_templates": DefaultTemplates;
  "fx:languages": PropertyHelper;
  "fx:language_strings": PropertyHelper;
  "fx:locales": PropertyHelper;
  "fx:payment_gateway_types": PropertyHelper;
  "fx:shipping_methods": IndexedCollection<ShippingMethod>;
  "fx:shipping_address_types": PropertyHelper;
  "fx:countries": PropertyHelper;
  "fx:regions": Regions;
  "fx:store_versions": IndexedCollection<StoreVersion>;
  "fx:timezones": PropertyHelper;
}

interface Reporting {
  "self": Reporting;
  "fx:reporting_store_domain_exists": never;
  "fx:reporting_email_exists": never;
}

interface Client {
  "self": Client;
  "fx:attributes": IndexedCollection<ClientAttribute>;
}

interface ClientAttribute {
  "self": ClientAttribute;
  "fx:client": Client;
}

interface User {
  "self": User;
  "default_store": Store;
  "fx:attributes": IndexedCollection<UserAttribute>;
  "fx:stores": Collection;
}

interface UserAttribute {
  "self": UserAttribute;
  "fx:user": User;
}

interface UserAccess {
  "self": UserAccess;
  "fx:store": Store;
  "fx:user": User;
}

interface CartAttribute {
  "self": CartAttribute;
  "fx:cart": Cart;
}

interface CustomerAddress {
  "self": CustomerAddress;
  "fx:store": Store;
  "fx:customer": Customer;
}

interface Address extends CustomerAddress {
  "self": Address;
  "fx:customer_addresses": IndexedCollection<CustomerAddress>;
}

interface PaymentMethod {
  "self": PaymentMethod;
  "fx:store": Store;
  "fx:customer": Customer;
}

interface CustomerAttribute {
  "self": CustomerAttribute;
  "fx:customer": Customer;
}

interface Customer {
  "self": Customer;
  "fx:attributes": IndexedCollection<CustomerAttribute>;
  "fx:store": Store;
  "fx:default_billing_address": Address;
  "fx:default_shipping_address": Address;
  "fx:default_payment_method": PaymentMethod;
  "fx:transactions": Collection;
  "fx:subscriptions": Collection;
  "fx:customer_addresses": IndexedCollection<Address>;
}

interface DiscountDetail {
  "self": DiscountDetail;
  "fx:store": Store;
  "fx:item": Item;
  "fx:transaction": Transaction;
}

interface CouponDetail {
  "self": CouponDetail;
  "fx:store": Store;
  "fx:item": Item;
  "fx:coupon": Coupon;
  "fx:coupon_code": CouponCode;
  "fx:transaction": Transaction;
}

interface Item {
  "self": Item;
  "fx:store": Store;
  "fx:cart": Cart;
  "fx:item_category": ItemCategory;
  "fx:item_options": IndexedCollection<ItemOption>;
  "fx:shipment": Shipment;
  "fx:discount_details": IndexedCollection<DiscountDetail>;
  "fx:coupon_details": IndexedCollection<CouponDetail>;
}

interface Tax {
  "self": Tax;
  "fx:store": Store;
  "fx:tax_item_categories": TaxItemCategories;
}

interface TaxItemCategories {
  "self": TaxItemCategories;
  "fx:store": Store;
  "fx:item_category": TaxItemCategory;
  "fx:tax": Tax;
}

interface TaxItemCategory {
  "self": TaxItemCategory;
  "fx:store": Store;
  "fx:item_category": ItemCategory;
}

interface ItemCategory {
  "self": ItemCategory;
  "fx:store": Store;
  "fx:downloadables": Downloadable;
  "fx:admin_email_template": Template;
  "fx:customer_email_template": Template;
  "fx:email_templates": Collection;
  "fx:tax_item_categories": TaxItemCategories;
}

interface ItemOption {
  "self": ItemOption;
  "fx:store": Store;
  "fx:transaction": Transaction;
  "fx:item": Item;
}

interface Cart {
  "self": Cart;
  "fx:attributes": IndexedCollection<CartAttribute>;
  "fx:store": Store;
  "fx:customer": IndexedCollection<Customer>;
  "fx:subscription": Subscription;
  "fx:items": IndexedCollection<Item>;
  "fx:discounts": IndexedCollection<Discount>;
  "fx:custom_fields": IndexedCollection<CustomField>;
}

interface StoreAttribute {
  "self": StoreAttribute;
  "fx:store": Store;
}

interface TransactionAttribute {
  "self": TransactionAttribute;
  "fx:transaction": Transaction;
}

interface DownloadablePurchase {
  "self": DownloadablePurchase;
  "fx:store": Store;
  "fx:customer": Customer;
  "fx:transaction": Transaction;
  "fx:item": Item;
  "fx:downloadable": Downloadable;
}

interface TransactionItem {
  "self": TransactionItem;
  "fx:store": Store;
  "fx:transaction": Transaction;
  "fx:item_category": ItemCategory;
  "fx:subscription": Subscription;
  "fx:item_options": IndexedCollection<ItemOption>;
  "fx:downloadable_purchase": DownloadablePurchase;
  "fx:shipment": Shipment;
}

interface CustomField {
  "self": CustomField;
  "fx:store": Store;
  "fx:transaction": Transaction;
}

interface Payment {
  "self": Payment;
  "fx:store": Store;
  "fx:transaction": Transaction;
}

interface AppliedTax {
  "self": AppliedTax;
  "fx:store": Store;
  "fx:transaction": Transaction;
  "fx:tax": Tax;
}

interface CouponCodeTransaction {
  "self": CouponCodeTransaction;
  "fx:store": Store;
  "fx:transaction": Transaction;
  "fx:coupon": Coupon;
  "fx:coupon_code": CouponCode;
}

interface CouponCode {
  "self": CouponCode;
  "fx:store": Store;
  "fx:coupon": Coupon;
  "fx:coupon_code_transactions": CouponCodeTransaction;
}

interface CouponItemCategory {
  "self": CouponItemCategory;
  "fx:store": Store;
  "fx:coupon": Coupon;
  "fx:item_category": ItemCategory;
}

interface Coupon {
  "self": Coupon;
  "fx:store": Store;
  "fx:generate_codes": never;
  "fx:coupon_codes": IndexedCollection<CouponCode>;
  "fx:coupon_item_categories": IndexedCollection<CouponItemCategory>;
}

interface Discount {
  "self": Discount;
  "fx:store": Store;
  "fx:transaction": Transaction;
  "fx:customer": Customer;
  "fx:coupon_code": CouponCode;
  "fx__coupon": Coupon;
}

interface Shipment {
  "self": Shipment;
  "fx:store": Store;
  "fx:custom_fields": IndexedCollection<CustomField>;
  "fx:items": IndexedCollection<Item>;
  "fx:transaction": Transaction;
  "fx:shipments": IndexedCollection<Shipment>;
  "fx:customer": Customer;
  "fx:customer_address": CustomerAddress;
}

interface BillingAddress {
  "self": BillingAddress;
  "fx:store": Store;
  "fx:transaction": Transaction;
  "fx:billing_addresses": IndexedCollection<BillingAddress>;
  "fx:customer": Customer;
  "fx:customer_address": CustomerAddress;
}

interface Transaction {
  "self": Transaction;
  "fx:attributes": IndexedCollection<TransactionAttribute>;
  "fx:store": Store;
  "fx:receipt": never;
  "fx:customer": Customer;
  "fx:subscription": Subscription;
  "fx:items": IndexedCollection<TransactionItem>;
  "fx:payments": IndexedCollection<Payment>;
  "fx:applied_taxes": IndexedCollection<AppliedTax>;
  "fx:custom_fields": IndexedCollection<CustomField>;
  "fx:discounts": IndexedCollection<Discount>;
  "fx:shipments": IndexedCollection<Shipment>;
  "fx:billing_addresses": IndexedCollection<BillingAddress>;
}

interface SubscriptionAttribute {
  "self": SubscriptionAttribute;
  "fx:subscription": Subscription;
}

interface Subscription {
  "self": Subscription;
  "fx:attributes": IndexedCollection<SubscriptionAttribute>;
  "fx:store": Store;
  "fx:customer": Customer;
  "fx:transactions": IndexedCollection<Transaction>;
  "fx:original_transaction": Transaction;
  "fx:last_transaction": Transaction;
  "fx:transaction_template": Cart;
  "fx:sub_token_url": never;
}

interface AlternatePaymentMethod {
  "self": AlternatePaymentMethod;
  "fx:store": Store;
  "fx:payment_method_sets": IndexedCollection<PaymentMethodSet>;
}

interface PaymentGateway {
  "self": PaymentGateway;
  "fx:store": Store;
  "fx:payment_method_sets": IndexedCollection<PaymentMethodSet>;
}

interface PaymentMethodSetHostedPaymentGateway {
  "self": PaymentMethodSetHostedPaymentGateway;
  "fx:store": Store;
  "fx:payment_method_set": PaymentMethodSet;
  "fx:alternate_payment_method": AlternatePaymentMethod;
}

interface FraudProtection {
  "self": FraudProtection;
  "fx:store": Store;
  "fx:payment_method_sets": IndexedCollection<PaymentMethodSet>;
}

interface PaymentMethodSetFraudProtection {
  "self": PaymentMethodSetFraudProtection;
  "fx:store": Store;
  "fx:payment_method_set": PaymentMethodSet;
  "fx:fraud_protection": FraudProtection;
}

interface PaymentMethodSet {
  "self": PaymentMethodSet;
  "fx:store": Store;
  "fx:payment_method_sets": IndexedCollection<PaymentMethodSet>;
  "fx:payment_gateway": PaymentGateway;
  "fx:payment_method_set_fraud_protections": IndexedCollection<PaymentMethodSetFraudProtection>;
  "fx:payment_method_set_hosted_payment_gateways": IndexedCollection<
    PaymentMethodSetHostedPaymentGateway
  >;
}

interface LanguageOverride {
  "self": LanguageOverride;
  "fx:language_overrides": IndexedCollection<LanguageOverride>;
  "fx:template_set": TemplateSet;
}

interface Template {
  "self": Template;
  "fx:store": Store;
  "fx:template_sets": IndexedCollection<TemplateSet>;
  "fx:cache": never;
}

interface TemplateSet {
  "self": TemplateSet;
  "fx:store": Store;
  "fx:cart_template": Template;
  "fx:cart_include_template": Template;
  "fx:checkout_template": Template;
  "fx:receipt_template": Template;
  "fx:email_template": Template;
  "fx:language_overrides": IndexedCollection<LanguageOverride>;
}

interface ErrorEntry {
  "self": ErrorEntry;
  "fx:store": Store;
  "fx:customer_id": never;
  "fx:transaction_id": never;
  "fx:subscription_id": never;
}

interface Downloadable {
  "self": Downloadable;
  "fx:store": Store;
  "fx:item_category": ItemCategory;
  "fx:downloadable_item_categories": never;
}

interface HostedPaymentGateway {
  "self": HostedPaymentGateway;
  "fx:store": Store;
  "fx:payment_method_sets": IndexedCollection<PaymentMethodSet>;
}

interface SubscriptionSettings {
  "self": SubscriptionSettings;
  "fx:store": Store;
}

interface Store {
  "self": Store;
  "fx:attributes": IndexedCollection<StoreAttribute>;
  "fx:store_version": StoreVersion;
  "fx:users": IndexedCollection<User>;
  "fx:user_accesses": IndexedCollection<UserAccess>;
  "fx:customers": Collection;
  "fx:carts": IndexedCollection<Cart>;
  "fx:transactions": IndexedCollection<Transaction>;
  "fx:subscriptions": IndexedCollection<Subscription>;
  "fx:subscription_settings": SubscriptionSettings;
  "fx:item_categories": IndexedCollection<ItemCategory>;
  "fx:taxes": IndexedCollection<Tax>;
  "fx:payment_method_sets": IndexedCollection<PaymentMethodSet>;
  "fx:coupons": IndexedCollection<Coupon>;
  "fx:template_sets": IndexedCollection<TemplateSet>;
  "fx:cart_templates": Collection;
  "fx:cart_include_templates": Collection;
  "fx:checkout_templates": Collection;
  "fx:receipt_templates": Collection;
  "fx:email_templates": Collection;
  "fx:error_entries": IndexedCollection<ErrorEntry>;
  "fx:downloadables": IndexedCollection<Downloadable>;
  "fx:hosted_payment_gateways": IndexedCollection<HostedPaymentGateway>;
  "fx:fraud_protections": IndexedCollection<FraudProtection>;
}

interface Rels {
  "self": Rels;
  "fx:admin_email_template": never;
  "fx:applied_coupon_codes": never;
  "fx:applied_taxes": never;
  "fx:attribute": never;
  "fx:attributes": never;
  "fx:billing_addresses": never;
  "fx:cart": never;
  "fx:cart_include_template": never;
  "fx:cart_include_templates": never;
  "fx:cart_template": never;
  "fx:cart_templates": never;
  "fx:checkout_template": never;
  "fx:checkout_templates": never;
  "fx:checkout_types": never;
  "fx:client": never;
  "fx:countries": never;
  "fx:coupon_codes": never;
  "fx:coupon_item_categories": never;
  "fx:coupon": never;
  "fx:coupon_code_transactions": never;
  "fx:create_client": never;
  "fx:create_session": never;
  "fx:create_user": never;
  "fx:customer": never;
  "fx:customer_address": never;
  "fx:customer_addresses": never;
  "fx:customer_password_hash_types": never;
  "fx:custom_fields": never;
  "fx:default_billing_address": never;
  "fx:default_shipping_address": never;
  "fx:default_payment_method": never;
  "fx:default_templates": never;
  "fx:downloadable_item_categories": never;
  "fx:downloadable": never;
  "fx:downloadable_purchase": never;
  "fx:discounts": never;
  "fx:discount_item_category": never;
  "fx:email_template": never;
  "fx:email_templates": never;
  "fx:encode": never;
  "fx:error_entries": never;
  "fx:generate_codes": never;
  "fx:hosted_payment_gateways": never;
  "fx:integrations": never;
  "fx:languages": never;
  "fx:language_overrides": never;
  "fx:language_strings": never;
  "fx:last_transaction": never;
  "fx:locale_codes": never;
  "fx:native_integrations": never;
  "fx:payments": never;
  "fx:payment_methods_expiring": never;
  "fx:payment_method_sets": never;
  "fx:payment_gateway": never;
  "fx:payment_gateways": never;
  "fx:fraud_protection": never;
  "fx:item": never;
  "fx:items": never;
  "fx:item_categories": never;
  "fx:item_category": never;
  "fx:item_options": never;
  "fx:receipt": never;
  "fx:receipt_template": never;
  "fx:receipt_templates": never;
  "fx:regions": never;
  "fx:reporting": never;
  "fx:reporting_store_domain_exists": never;
  "fx:reporting_email_exists": never;
  "fx:property_helper": never;
  "fx:property_helpers": never;
  "fx:shipping_container": never;
  "fx:shipping_containers": never;
  "fx:shipping_drop_type": never;
  "fx:shipping_drop_types": never;
  "fx:shipping_method": never;
  "fx:shipping_methods": never;
  "fx:shipping_service": never;
  "fx:shipping_services": never;
  "fx:shipment": never;
  "fx:shipments": never;
  "fx:shipping_address_types": never;
  "fx:store": never;
  "fx:stores": never;
  "fx:store_version": never;
  "fx:store_versions": never;
  "fx:store_shipping_methods": never;
  "fx:store_shipping_method": never;
  "fx:store_shipping_services": never;
  "fx:store_shipping_service": never;
  "fx:subscription": never;
  "fx:subscriptions": never;
  "fx:subscription_settings": never;
  "fx:process_subscription_webhook": never;
  "fx:sub_token_url": never;
  "fx:template_config": never;
  "fx:template_configs": never;
  "fx:template_set": never;
  "fx:template_sets": never;
  "fx:timezones": never;
  "fx:token": never;
  "fx:transaction": never;
  "fx:transaction_template": never;
  "fx:user": never;
  "fx:users": never;
  "fx:user_accesses": never;
}

export interface Graph {
  "self": Graph;
  "rels": Rels;
  "fx:property_helpers": PropertyHelpers;
  "fx:reporting": Reporting;
  "fx:create_client": never;
  "fx:client": Client;
  "fx:create_user": never;
  "fx:user": User;
  "fx:store": Store;
  "fx:stores": IndexedCollection<Store>;
  "fx:token": never;
}
