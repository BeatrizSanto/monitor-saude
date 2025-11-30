import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Database } from "lucide-react";
import { toast } from "sonner";
import type { HealthUnit } from "../../../drizzle/schema";

type FormData = {
  name: string;
  type: "ubs" | "posto" | "hospital";
  address: string;
  latitude: string;
  longitude: string;
  phone: string;
  occupancyLevel: "baixo" | "medio" | "alto" | "critico";
  averageWaitTime: number;
  waitingCount: number;
};

const initialFormData: FormData = {
  name: "",
  type: "ubs",
  address: "",
  latitude: "",
  longitude: "",
  phone: "",
  occupancyLevel: "medio",
  averageWaitTime: 30,
  waitingCount: 0,
};

const typeLabels = {
  ubs: "UBS",
  posto: "Posto de Saúde",
  hospital: "Hospital",
};

const occupancyLabels = {
  baixo: "Baixa",
  medio: "Média",
  alto: "Alta",
  critico: "Crítica",
};

export default function Admin() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<HealthUnit | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = trpc.useUtils();
  const { data: units, isLoading } = trpc.healthUnits.list.useQuery();
  const createMutation = trpc.healthUnits.create.useMutation();
  const updateMutation = trpc.healthUnits.update.useMutation();
  const deleteMutation = trpc.healthUnits.delete.useMutation();
  const seedMutation = trpc.healthUnits.seed.useMutation();

  const handleOpenDialog = (unit?: HealthUnit) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        name: unit.name,
        type: unit.type,
        address: unit.address,
        latitude: unit.latitude,
        longitude: unit.longitude,
        phone: unit.phone || "",
        occupancyLevel: unit.occupancyLevel,
        averageWaitTime: unit.averageWaitTime,
        waitingCount: unit.waitingCount,
      });
    } else {
      setEditingUnit(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUnit(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingUnit) {
        await updateMutation.mutateAsync({
          id: editingUnit.id,
          ...formData,
        });
        toast.success("Unidade atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Unidade criada com sucesso!");
      }
      await utils.healthUnits.list.invalidate();
      handleCloseDialog();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar unidade");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta unidade?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Unidade deletada com sucesso!");
      await utils.healthUnits.list.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar unidade");
    }
  };

  const handleSeed = async () => {
    if (!confirm("Deseja popular o banco com dados de exemplo? Isso pode criar duplicatas.")) return;

    try {
      const result = await seedMutation.mutateAsync();
      toast.success(`${result.count} unidades criadas com sucesso!`);
      await utils.healthUnits.list.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao popular banco de dados");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Por favor, faça login para acessar esta página.</p>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Unidades de Saúde</h1>
            <p className="text-gray-600 mt-1">Adicione, edite ou remova unidades do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSeed}>
              <Database className="w-4 h-4 mr-2" />
              Popular Banco
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Unidade
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Unidades Cadastradas</CardTitle>
            <CardDescription>
              {units?.length || 0} {units?.length === 1 ? "unidade cadastrada" : "unidades cadastradas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : units && units.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Ocupação</TableHead>
                      <TableHead>Tempo Médio</TableHead>
                      <TableHead>Aguardando</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {units.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">{unit.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{typeLabels[unit.type]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{occupancyLabels[unit.occupancyLevel]}</Badge>
                        </TableCell>
                        <TableCell>{unit.averageWaitTime} min</TableCell>
                        <TableCell>{unit.waitingCount}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(unit)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(unit.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma unidade cadastrada. Clique em "Nova Unidade" para começar.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUnit ? "Editar Unidade" : "Nova Unidade"}</DialogTitle>
            <DialogDescription>
              {editingUnit ? "Atualize as informações da unidade" : "Adicione uma nova unidade de saúde"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nome da Unidade</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "ubs" | "posto" | "hospital") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ubs">UBS</SelectItem>
                      <SelectItem value="posto">Posto de Saúde</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="occupancyLevel">Nível de Ocupação</Label>
                  <Select
                    value={formData.occupancyLevel}
                    onValueChange={(value: "baixo" | "medio" | "alto" | "critico") =>
                      setFormData({ ...formData, occupancyLevel: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixo">Baixa</SelectItem>
                      <SelectItem value="medio">Média</SelectItem>
                      <SelectItem value="alto">Alta</SelectItem>
                      <SelectItem value="critico">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="-23.550520"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="-46.633308"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 3333-4444"
                  />
                </div>

                <div>
                  <Label htmlFor="averageWaitTime">Tempo Médio (min)</Label>
                  <Input
                    id="averageWaitTime"
                    type="number"
                    value={formData.averageWaitTime}
                    onChange={(e) =>
                      setFormData({ ...formData, averageWaitTime: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="waitingCount">Pessoas Aguardando</Label>
                  <Input
                    id="waitingCount"
                    type="number"
                    value={formData.waitingCount}
                    onChange={(e) =>
                      setFormData({ ...formData, waitingCount: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>{editingUnit ? "Atualizar" : "Criar"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
