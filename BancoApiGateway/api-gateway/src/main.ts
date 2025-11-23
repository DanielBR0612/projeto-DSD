import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; 
import { HateoasInterceptor } from './common/hateoas.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permitir CORS para todas as origens (inclui requests origin 'null' vindo de file://)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
  
  const config = new DocumentBuilder()
    .setTitle('API Gateway Bancário')
    .setDescription('Gateway para integração de serviços Legados (SOAP) e Modernos (REST)')
    .setVersion('1.0')
    .addTag('banco-soap', 'Operações no sistema legado Java')
    .addTag('banco-rest', 'Operações no sistema moderno Kotlin')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 

  app.useGlobalInterceptors(new HateoasInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
