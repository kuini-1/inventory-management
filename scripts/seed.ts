const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    await prisma.$transaction([
        prisma.orderItem.deleteMany(),
        prisma.order.deleteMany(),
        prisma.inventoryTransaction.deleteMany(),
        prisma.inventoryTransactionType.deleteMany(),
        prisma.product.deleteMany(),
        prisma.category.deleteMany(),
        prisma.supplier.deleteMany(),
        prisma.user.deleteMany(),
        prisma.role.deleteMany(),
    ])

    const [userRole, adminRole] = await Promise.all([
        prisma.role.create({
            data: { name: 'user' }
        }),
        prisma.role.create({
            data: { name: 'admin' }
        })
    ])

    const hashedPassword = await bcrypt.hash('123456', 10)
    await prisma.user.createMany({
        data: [
            {
                username: 'admin',
                password: hashedPassword,
                roleId: adminRole.id
            },
            {
                username: 'user',
                password: hashedPassword,
                roleId: userRole.id
            }
        ]
    })

    const electronics = await prisma.category.create({
        data: {
            name: 'Electronics',
            description: 'Electronic gadgets and devices',
        },
    })

    const furniture = await prisma.category.create({
        data: {
            name: 'Furniture',
            description: 'Home and office furniture',
        },
    })

    const supplier1 = await prisma.supplier.create({
        data: {
            name: 'Supplier One',
            contact: 'Aom',
            email: 'supplier1@example.com',
            phone: '123-456-7890',
        },
    })

    const supplier2 = await prisma.supplier.create({
        data: {
            name: 'Supplier Two',
            contact: 'Neyarsh',
            email: 'supplier2@example.com',
            phone: '098-765-4321',
        },
    })

    const products = await Promise.all([
        prisma.product.create({
            data: {
                name: 'Smartphone',
                sku: 'ELEC123',
                price: 299.99,
                categoryId: electronics.id,
                supplierId: supplier1.id,
                description: 'A high-end smartphone',
            }
        }),
        prisma.product.create({
            data: {
                name: 'Office Chair',
                sku: 'FURN456',
                price: 89.99,
                categoryId: furniture.id,
                supplierId: supplier2.id,
                description: 'Ergonomic office chair',
            }
        })
    ])

    await prisma.order.create({
        data: {
            customerName: 'Tangmay',
            orderItems: {
                create: [
                    {
                        productId: products[0].id,
                        quantity: 1,
                        price: 299.99,
                    },
                    {
                        productId: products[1].id,
                        quantity: 1,
                        price: 89.99,
                    },
                ],
            },
        },
    })

    const [inbound, outbound, adjustment] = await Promise.all([
        prisma.inventoryTransactionType.create({
            data: { type: 'Inbound' }
        }),
        prisma.inventoryTransactionType.create({
            data: { type: 'Outbound' }
        }),
        prisma.inventoryTransactionType.create({
            data: { type: 'Adjustment' }
        })
    ])

    await prisma.inventoryTransaction.createMany({
        data: [
            {
                productId: products[0].id,
                quantity: 10,
                typeId: inbound.id
            },
            {
                productId: products[1].id,
                quantity: 2,
                typeId: outbound.id
            }
        ]
    })

    console.log('Test data created successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 