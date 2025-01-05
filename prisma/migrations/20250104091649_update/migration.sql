/*
  Warnings:

  - You are about to drop the column `type` on the `InventoryTransaction` table. All the data in the column will be lost.
  - Added the required column `typeId` to the `InventoryTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InventoryTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryTransaction_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "InventoryTransactionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InventoryTransaction" ("createdAt", "id", "productId", "quantity") SELECT "createdAt", "id", "productId", "quantity" FROM "InventoryTransaction";
DROP TABLE "InventoryTransaction";
ALTER TABLE "new_InventoryTransaction" RENAME TO "InventoryTransaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
