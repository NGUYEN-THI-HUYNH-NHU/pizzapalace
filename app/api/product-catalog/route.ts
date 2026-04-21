import { NextResponse } from 'next/server';

import getProductCatalog from '@/actions/get-product-catalog';

export async function GET() {
    try {
        const products = await getProductCatalog();
        return NextResponse.json(products);
    } catch (error) {
        console.error('[PRODUCT_CATALOG_GET]', error);
        return NextResponse.json([], { status: 500 });
    }
}
