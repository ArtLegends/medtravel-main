// app/(auth)/loading.tsx
import {
  Card,
  CardBody,
  CardHeader,
} from "@/components/shared/HeroUIComponents";

export default function Loading() {
  return (
    <Card className="w-full max-w-md animate-pulse">
      <CardHeader className="pb-6">
        <div className="h-8 w-32 bg-default-200 rounded" />
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="h-10 bg-default-100 rounded" />
        <div className="h-10 bg-default-100 rounded" />
        <div className="h-10 bg-primary/20 rounded" />
      </CardBody>
    </Card>
  );
}
