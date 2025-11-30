import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { MapView } from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, MapPin, Phone, Clock, Users, Navigation } from "lucide-react";
import type { HealthUnit } from "../../../drizzle/schema";

type FilterType = "todos" | "ubs" | "posto" | "hospital";

const occupancyColors = {
  baixo: { bg: "#4ade80", label: "Baixa", textColor: "#166534" },
  medio: { bg: "#fbbf24", label: "Média", textColor: "#92400e" },
  alto: { bg: "#fb923c", label: "Alta", textColor: "#9a3412" },
  critico: { bg: "#ef4444", label: "Crítica", textColor: "#991b1b" },
};

const typeLabels = {
  ubs: "UBS",
  posto: "Posto de Saúde",
  hospital: "Hospital",
};

export default function Home() {
  const [filter, setFilter] = useState<FilterType>("todos");
  const [selectedUnit, setSelectedUnit] = useState<HealthUnit | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);

  const { data: units, isLoading } = trpc.healthUnits.list.useQuery();

  const filteredUnits = useMemo(() => {
    if (!units) return [];
    if (filter === "todos") return units;
    return units.filter((unit) => unit.type === filter);
  }, [units, filter]);

  const handleMapReady = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  };

  // Atualizar marcadores quando as unidades filtradas mudarem
  useMemo(() => {
    if (!map || !filteredUnits.length) return;

    // Limpar marcadores antigos
    markers.forEach((marker) => marker.map = null);
    setMarkers([]);

    const bounds = new google.maps.LatLngBounds();
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    filteredUnits.forEach((unit) => {
      const position = {
        lat: parseFloat(unit.latitude),
        lng: parseFloat(unit.longitude),
      };

      // Criar elemento do marcador com cor baseada na ocupação
      const markerElement = document.createElement("div");
      markerElement.style.width = "32px";
      markerElement.style.height = "32px";
      markerElement.style.borderRadius = "50%";
      markerElement.style.backgroundColor = occupancyColors[unit.occupancyLevel].bg;
      markerElement.style.border = "3px solid white";
      markerElement.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      markerElement.style.cursor = "pointer";

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        content: markerElement,
        title: unit.name,
      });

      marker.addListener("click", () => {
        setSelectedUnit(unit);
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    setMarkers(newMarkers);

    // Ajustar o mapa para mostrar todos os marcadores
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
    }
  }, [map, filteredUnits]);

  const handleGetDirections = (unit: HealthUnit) => {
    const destination = `${unit.latitude},${unit.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Monitor de Unidades de Saúde</h1>
          <p className="text-gray-600 mt-1">
            Encontre a unidade de saúde mais próxima com menor tempo de espera
          </p>
        </div>
      </header>

      {/* Filtros */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3">
          <Button
            variant={filter === "todos" ? "default" : "outline"}
            onClick={() => setFilter("todos")}
          >
            Todas
          </Button>
          <Button
            variant={filter === "ubs" ? "default" : "outline"}
            onClick={() => setFilter("ubs")}
          >
            UBS
          </Button>
          <Button
            variant={filter === "posto" ? "default" : "outline"}
            onClick={() => setFilter("posto")}
          >
            Postos de Saúde
          </Button>
          <Button
            variant={filter === "hospital" ? "default" : "outline"}
            onClick={() => setFilter("hospital")}
          >
            Hospitais
          </Button>
        </div>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="text-sm font-medium text-gray-700">Nível de ocupação:</div>
          {Object.entries(occupancyColors).map(([key, { bg, label }]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: bg }}
              />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mapa e Lista */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Mapa */}
          <Card className="lg:col-span-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[600px]">
                <MapView
                  onMapReady={handleMapReady}
                  initialCenter={{ lat: -23.550520, lng: -46.633308 }}
                  initialZoom={12}
                  className="h-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Unidades */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Unidades Disponíveis</CardTitle>
              <CardDescription>
                {filteredUnits.length} {filteredUnits.length === 1 ? "unidade encontrada" : "unidades encontradas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[520px] overflow-y-auto">
                {filteredUnits.map((unit) => (
                  <Card
                    key={unit.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedUnit(unit)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{unit.name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {typeLabels[unit.type]}
                          </Badge>
                        </div>
                        <Badge
                          style={{
                            backgroundColor: occupancyColors[unit.occupancyLevel].bg,
                            color: occupancyColors[unit.occupancyLevel].textColor,
                          }}
                        >
                          {occupancyColors[unit.occupancyLevel].label}
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Tempo médio: {unit.averageWaitTime} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{unit.waitingCount} pessoas aguardando</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedUnit} onOpenChange={() => setSelectedUnit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedUnit?.name}</DialogTitle>
            <DialogDescription>
              <Badge variant="outline">{selectedUnit && typeLabels[selectedUnit.type]}</Badge>
            </DialogDescription>
          </DialogHeader>

          {selectedUnit && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Nível de Ocupação</span>
                  <Badge
                    style={{
                      backgroundColor: occupancyColors[selectedUnit.occupancyLevel].bg,
                      color: occupancyColors[selectedUnit.occupancyLevel].textColor,
                    }}
                  >
                    {occupancyColors[selectedUnit.occupancyLevel].label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Endereço</div>
                    <div className="text-sm text-gray-600">{selectedUnit.address}</div>
                  </div>
                </div>

                {selectedUnit.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Telefone</div>
                      <div className="text-sm text-gray-600">{selectedUnit.phone}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Tempo Médio de Espera</div>
                    <div className="text-sm text-gray-600">{selectedUnit.averageWaitTime} minutos</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Pessoas Aguardando</div>
                    <div className="text-sm text-gray-600">{selectedUnit.waitingCount}</div>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => handleGetDirections(selectedUnit)}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Como Chegar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
