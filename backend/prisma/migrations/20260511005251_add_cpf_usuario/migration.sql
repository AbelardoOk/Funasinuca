/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "cpf" CHAR(11);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");
