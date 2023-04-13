import fetch from "cross-fetch";

type ShopifyProduct = {
  id: number;
  title: string;
  body_html: string | null;
  tags: string;
  product_type: string;
  // CAN BE BETTER if we add necessary fields from these:
  // "vendor": "store for the first app",
  // "created_at": "2023-02-14T08:09:09-05:00",
  // "handle": "blue-snow",
  // "updated_at": "2023-02-14T08:09:09-05:00",
  // "published_at": null,
  // "template_suffix": null,
  // "status": "active",
  // "published_scope": "web",
  // "admin_graphql_api_id": "gid://shopify/Product/8131402531134",
  // "variants": [
  //     {
  //         "id": 44541823418686,
  //         "product_id": 8131402531134,
  //         "title": "Default Title",
  //         "price": "5.48",
  //         "sku": "",
  //         "position": 1,
  //         "inventory_policy": "deny",
  //         "compare_at_price": null,
  //         "fulfillment_service": "manual",
  //         "inventory_management": null,
  //         "option1": "Default Title",
  //         "option2": null,
  //         "option3": null,
  //         "created_at": "2023-02-14T08:09:09-05:00",
  //         "updated_at": "2023-02-14T08:09:09-05:00",
  //         "taxable": true,
  //         "barcode": null,
  //         "grams": 0,
  //         "image_id": null,
  //         "weight": 0.0,
  //         "weight_unit": "kg",
  //         "inventory_item_id": 46590948114750,
  //         "inventory_quantity": 0,
  //         "old_inventory_quantity": 0,
  //         "requires_shipping": true,
  //         "admin_graphql_api_id": "gid://shopify/ProductVariant/44541823418686"
  //     }
  // ],
  // "options": [
  //     {
  //         "id": 10320963731774,
  //         "product_id": 8131402531134,
  //         "name": "Title",
  //         "position": 1,
  //         "values": [
  //             "Default Title"
  //         ]
  //     }
  // ],
  // "images": [],
  // "image": null
};

export async function getShopifyProducts() {
  try {
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_NAME}.myshopify.com/admin/api/2023-01/products.json`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || ""
        }
      }
    );
    if (!response.ok) return Promise.resolve([]);

    const json = (await response.json()) as { products: ShopifyProduct[] };
    return json.products;
  } catch (error) {
    console.log("Error on getShopifyProducts", error);
    return Promise.resolve([]);
  }
}
