# TaxAccount Frontend - Complete Documentation
## Angular 21 Multi-Tenant Accounting Application UI

---

## 📋 PROJECT OVERVIEW

**Name**: TaxAccount-Frontend  
**Type**: Single Page Application (SPA) - Angular 21  
**Purpose**: Multi-tenant tax accounting web application user interface  
**Repositories**: 
- Frontend: [TaxAccount-Frontend](https://github.com/codegovind/TaxAccount-Frontend)
- Backend API: [TaxAccount-API](https://github.com/codegovind/TaxAccount-API)

**Technology Stack**: Angular 21, TypeScript, SCSS, Angular Material  
**Deployment**: AWS S3 + CloudFront CDN  
**Status**: Active Development (v0.1)

---

## 🏗️ ARCHITECTURE OVERVIEW

### Frontend Architecture Pattern
```
┌─────────────────────────────────────────┐
│         Angular 21 SPA                  │
├─────────────────────────────────────────┤
│  Standalone Components + Signals         │
│  Lazy-Loaded Feature Modules             │
│  AppLayoutComponent (Master Layout)      │
├─────────────────────────────────────────┤
│  Core Services (HTTP + Auth)             │
│  HTTP Client + JWT Interceptor           │
│  Auth Guard + Protected Routes           │
├─────────────────────────────────────────┤
│  Public Routes: /auth                    │
│  Protected Routes: /dashboard, /products │
├─────────────────────────────────────────┤
│  API Backend (localhost:8080 or CDN)     │
│  Local: http://localhost:8080            │
│  Cloud: https://d3dpmdc1qjwvnh.cloudfront.net │
└─────────────────────────────────────────┘
```

### Key Technologies
| Aspect | Technology | Version |
|--------|-----------|---------|
| Framework | Angular | 21.1.0 |
| Language | TypeScript | 5.9.2 |
| Styling | SCSS | CSS3 |
| UI Library | Angular Material | 21.2.6 |
| HTTP Client | HttpClient | Built-in |
| Routing | Angular Router | 21.1.0 |
| Forms | Reactive Forms | Built-in |
| State | Signals (RxJS alt) | Built-in |
| Animations | Angular Animations | 21.2.8 |
| Package Manager | npm | 10.8.2 |
| Node.js | — | 20.19.0 |
| CDK | Angular CDK | 21.2.6 |

---

## 📁 PROJECT STRUCTURE

### Root Directory
```
taxaccount-frontend/
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml (CI/CD Pipeline)
├── .vscode/
│   └── settings.json (Editor config)
├── public/
│   └── favicon.ico
├── src/
│   ├── app/ (Angular Application)
│   ├── environments/ (Config files)
│   ├── styles.scss (Global styles)
│   ├── index.html (HTML entry)
│   └── main.ts (Bootstrap)
├── angular.json (Angular CLI config)
├── package.json (Dependencies)
├── tsconfig.json (TypeScript config)
├── .editorconfig (Code formatting)
├── .gitignore (Git config)
├── README.md (Project info)
└── LICENSE (MIT License)
```

### src/app Directory Structure
```
src/app/
│
├── app.ts                          [Root Component]
├── app.html                        [Router Outlet]
├── app.scss                        [Component Styles]
├── app.config.ts                   [DI Configuration]
├── app.routes.ts                   [Route Configuration]
│
├── auth/                           [Authentication Module]
│   ├── login/
│   │   ├── login.ts (Component)
│   │   ├── login.html (Template)
│   │   ├── login.scss (Styles)
│   │   └── login.spec.ts (Tests)
│   ├── register/
│   │   ├── register.ts (Component)
│   │   ├── register.html (Template)
│   │   ├── register.scss (Styles)
│   │   └── register.spec.ts (Tests)
│   └── auth.module.ts (Module Definition)
│
├── core/                           [Core Services & Guards]
│   ├── guards/
│   │   ├── auth-guard.ts (Route Protection)
│   │   └── auth-guard.spec.ts
│   ├── interceptors/
│   │   ├── auth-interceptor.ts (JWT Injection)
│   │   └── auth-interceptor.spec.ts
│   ├── models/
│   │   ├── auth.model.ts
│   │   ├── contact.model.ts
│   │   ├── invoice.model.ts
│   │   ├── product.model.ts
│   │   ├── purchase.model.ts
│   │   ├── stock.model.ts
│   │   ├── accounting.model.ts
│   │   ├── compliance.model.ts
│   │   └── user.model.ts
│   └── services/
│       ├── auth.service.ts (Auth Logic)
│       ├── contact.service.ts (Contact API)
│       ├── home.service.ts (Dashboard Data)
│       ├── invoice.service.ts (Invoice API)
│       ├── product.service.ts (Product API)
│       ├── purchase.service.ts (Purchase API)
│       ├── stock.service.ts (Stock API)
│       ├── accounting.service.ts (Accounting API)
│       ├── compliance.service.ts (Compliance API)
│       ├── tenant.service.ts (Tenant Data)
│       └── (all services have .spec.ts tests)
│
├── shared/                         [Reusable Components & Modules]
│   ├── layout/
│   │   ├── layout.ts (Master Container)
│   │   ├── layout.html
│   │   ├── layout.scss
│   │   └── layout.spec.ts
│   ├── sidebar/
│   │   ├── sidebar.ts (Navigation Menu)
│   │   ├── sidebar.html
│   │   ├── sidebar.scss
│   │   └── sidebar.spec.ts
│   ├── quick-add-vendor/
│   │   ├── quick-add-vendor.ts (Modal)
│   │   ├── quick-add-vendor.html
│   │   ├── quick-add-vendor.scss
│   │   └── quick-add-vendor.spec.ts
��   ├── quick-add-product/
│   │   ├── quick-add-product.ts (Modal)
│   │   ├── quick-add-product.html
│   │   ├── quick-add-product.scss
│   │   └── quick-add-product.spec.ts
│   └── shared.module.ts (Common Exports)
│
├── dashboard/                      [Dashboard Feature Module]
│   ├── dashboard/
│   │   ├── dashboard.ts (Standalone Component)
│   │   ├── dashboard.html
│   │   ├── dashboard.scss
│   │   └── dashboard.spec.ts
│   └── dashboard.module.ts (Module Definition)
│
├── products/                       [Products Feature Module]
│   ├── product-list/
│   │   ├── product-list.ts (Standalone)
│   │   ├── product-list.html
│   │   ├── product-list.scss
│   │   └── product-list.spec.ts
│   ├── product-create/
│   │   ├── product-create.ts (Standalone)
│   │   ├── product-create.html
│   │   ├── product-create.scss
│   │   └── product-create.spec.ts
│   └── products.module.ts (Module Definition)
│
├── contacts/                       [Contacts Feature Module]
│   ├── contact-list/
│   │   ├── contact-list.ts (Standalone)
│   │   ├── contact-list.html
│   │   ├── contact-list.scss
│   │   └── contact-list.spec.ts
│   ├── contact-create/
│   │   ├── contact-create.ts (Standalone)
│   │   ├── contact-create.html
│   │   ├── contact-create.scss
│   │   └── contact-create.spec.ts
│   └── contacts.module.ts (Module Definition)
│
├── stock/                          [Stock Management Module]
│   ├── stock-list/
│   │   ├── stock-list.ts (Standalone)
│   │   ├── stock-list.html
│   │   ├── stock-list.scss
│   │   └── stock-list.spec.ts
│   ├── stock-adjust/
│   │   ├── stock-adjust.ts (Standalone)
│   │   ├── stock-adjust.html
│   │   ├── stock-adjust.scss
│   │   └── stock-adjust.spec.ts
│   └── stock.module.ts (Module Definition)
│
├── invoices/                       [Invoices Feature Module]
│   ├── invoice-list/
│   │   ├── invoice-list.ts (Standalone)
│   │   ├── invoice-list.html
│   │   ├── invoice-list.scss
│   │   └── invoice-list.spec.ts
│   ├── invoice-create/
│   │   ├── invoice-create.ts (Standalone)
│   │   ├── invoice-create.html
│   │   ├── invoice-create.scss
│   │   └── invoice-create.spec.ts
│   ├── invoice-detail/
│   │   ├── invoice-detail.ts (Standalone)
│   │   ├── invoice-detail.html
│   │   ├── invoice-detail.scss
│   │   └── invoice-detail.spec.ts
│   └── invoices.module.ts (Module Definition)
│
├── purchase/                       [Purchase Feature Module]
│   ├── purchase-list/
│   │   ├── purchase-list.ts (Standalone)
│   │   ├── purchase-list.html
│   │   ├── purchase-list.scss
│   │   └── purchase-list.spec.ts
│   ├── purchase-create/
│   │   ├── purchase-create.ts (Standalone)
│   │   ├── purchase-create.html
│   │   ├── purchase-create.scss
│   │   └── purchase-create.spec.ts
│   ├── purchase-detail/
│   │   ├── purchase-detail.ts (Standalone)
│   │   ├── purchase-detail.html
│   │   ├── purchase-detail.scss
│   │   └── purchase-detail.spec.ts
│   ├── order-list/
│   │   ├── order-list.ts (Standalone)
│   │   ├── order-list.html
│   │   ├── order-list.scss
│   │   └── order-list.spec.ts
│   ├── order-create/
│   │   ├── order-create.ts (Standalone)
│   │   ├── order-create.html
│   │   ├── order-create.scss
│   │   └── order-create.spec.ts
│   └── purchase.module.ts (Module Definition)
│
├── accounting/                     [Accounting Feature Module] NEW
│   ├── chart-of-accounts/
│   │   ├── chart-of-accounts.ts
│   │   ├── chart-of-accounts.html
│   │   ├── chart-of-accounts.scss
│   │   └── chart-of-accounts.spec.ts
│   ├── general-ledger/
│   │   ├── general-ledger.ts
│   │   ├── general-ledger.html
│   │   ├── general-ledger.scss
│   │   └── general-ledger.spec.ts
│   ├── trial-balance/
│   │   ├── trial-balance.ts
│   │   ├── trial-balance.html
│   │   ├── trial-balance.scss
│   │   └── trial-balance.spec.ts
│   ├── reports/
│   │   ├── reports.ts
│   │   ├── reports.html
│   │   ├── reports.scss
│   │   └── reports.spec.ts
│   └── accounting.module.ts
│
├── compliance/                     [Compliance Feature Module] NEW
│   ├── eway-bill/
│   │   ├── eway-bill.ts
│   │   ├── eway-bill.html
│   │   ├── eway-bill.scss
│   │   └── eway-bill.spec.ts
│   └── compliance.module.ts
│
├── settings/                       [Settings Feature Module] NEW
│   ├── tenant-settings/
│   │   ├── tenant-settings.ts
│   │   ├── tenant-settings.html
│   │   ├── tenant-settings.scss
│   │   └── tenant-settings.spec.ts
│   └── settings.module.ts
│
└── inventory/                      [Inventory/Stock Feature Module]
    ├── inventory-list/
    │   ├── inventory-list.ts
    │   ├── inventory-list.html
    │   ├── inventory-list.scss
    │   └── inventory-list.spec.ts
    └── inventory.module.ts
```

---

## 🎯 COMPONENT ARCHITECTURE

### Component Hierarchy
```
App (Root)
└── Router Outlet
    ├── Public Routes (no guard)
    │   └── auth/
    │       ├── login/
    │       └── register/
    │
    └── Protected Routes (with authGuard)
        └── AppLayoutComponent (Master)
            ├── Sidebar (Navigation)
            ├── Main Content Area
            │   └── Feature Component (Lazy Loaded)
            │       ├── dashboard/
            │       ├── products/
            │       ├── contacts/
            │       ├── invoices/
            │       ├── purchase/
            │       ├── stock/
            │       ├── accounting/
            │       ├── compliance/
            │       └── settings/
            │
            └── Quick-Add Modals
                ├── quick-add-product/
                └── quick-add-vendor/
```

### Component Types
**Standalone Components** (No module)
```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule],
  template: `...`,
  styles: [`...`]
})
export class LoginComponent { }
```

**Lazy-Loaded Modules**
```typescript
// In app.routes.ts
{
  path: 'products',
  loadChildren: () => import('./products/products.module')
    .then(m => m.ProductsModule)
}
```

---

## 🔐 AUTHENTICATION FLOW

### Login Process
```
1. User enters email + password
2. LoginComponent calls AuthService.login()
3. AuthService makes POST /api/auth/login
4. Backend validates credentials
5. Backend returns JWT token + user data
6. localStorage stores AuthResponse:
   {
     token: "eyJhbGc...",
     email: "user@example.com",
     fullName: "John Doe",
     role: "Owner",
     companyName: "ABC Pvt Ltd",
     tenantId: 1,
     permissions: [...],
     expiresAt: "2026-06-02T10:30:00Z"
   }
7. AuthGuard allows access to protected routes
8. AuthInterceptor adds JWT to all API requests
```

### Auth Guard Implementation
```typescript
// Checks localStorage for valid token
// Redirects to /auth/login if not authenticated
// Validates token expiry
// Allows route navigation if valid
```

### Auth Interceptor
```typescript
// Runs on every HTTP request
// Adds Authorization: Bearer <token>
// Handles 401 responses (redirect to login)
// Re-throws errors for component error handling
```

---

## 🌐 HTTP SERVICE LAYER

### Service Pattern (Example: ProductService)
```typescript
export class ProductService {
  private apiUrl = environment.apiUrl + '/products';
  
  constructor(private http: HttpClient) { }
  
  // GET all products
  getProducts(page: number = 1): Observable<ProductResponse[]>
  
  // GET single product
  getProduct(id: number): Observable<ProductDto>
  
  // POST create product
  createProduct(dto: CreateProductDto): Observable<ProductDto>
  
  // PUT update product
  updateProduct(id: number, dto: UpdateProductDto): Observable<ProductDto>
  
  // DELETE product
  deleteProduct(id: number): Observable<void>
}
```

### Error Handling Pattern
```typescript
// In component
this.productService.getProducts().subscribe({
  next: (data) => {
    this.products.set(data);
  },
  error: (err: HttpErrorResponse) => {
    this.error.set(err.error.message || 'Failed to load');
  }
});
```

---

## 📊 STATE MANAGEMENT WITH SIGNALS

### Signal Patterns Used
```typescript
// Basic Signal
private products = signal<Product[]>([]);
public products$ = this.products.asReadonly();

// Computed Signal
public totalProducts = computed(() => 
  this.products().length
);

// State Update
this.products.set(newProducts);        // Replace
this.products.update(p => [...p, new]); // Modify

// Using in Template
@if (products().length > 0) {
  @for (product of products(); track product.id) {
    {{ product.name }}
  }
}
```

### Why Signals Over RxJS?
- Simpler syntax for simple state
- Automatic change detection
- Smaller bundle size for small apps
- Perfect for multi-tenant state (tenantId)

---

## 📋 ROUTING CONFIGURATION

### Full Route Tree
```typescript
export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  
  // Public authentication routes (no guard)
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module')
      .then(m => m.AuthModule)
  },
  
  // Protected application routes (with authGuard)
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Dashboard (Standalone)
      {
        path: 'dashboard',
        loadComponent: () => 
          import('./dashboard/dashboard/dashboard')
          .then(c => c.DashboardComponent)
      },
      
      // Feature Modules (Lazy-loaded)
      {
        path: 'products',
        loadChildren: () => 
          import('./products/products.module')
          .then(m => m.ProductsModule)
      },
      {
        path: 'contacts',
        loadChildren: () => 
          import('./contacts/contacts.module')
          .then(m => m.ContactsModule)
      },
      {
        path: 'stock',
        loadChildren: () => 
          import('./stock/stock.module')
          .then(m => m.StockModule)
      },
      {
        path: 'purchase',
        loadChildren: () => 
          import('./purchase/purchase.module')
          .then(m => m.PurchaseModule)
      },
      {
        path: 'invoices',
        loadChildren: () => 
          import('./invoices/invoices.module')
          .then(m => m.InvoicesModule)
      },
      {
        path: 'accounting',
        loadChildren: () => 
          import('./accounting/accounting.module')
          .then(m => m.default)
      },
      {
        path: 'compliance',
        loadChildren: () => 
          import('./compliance/compliance.module')
          .then(m => m.default)
      },
      {
        path: 'settings',
        loadChildren: () => 
          import('./settings/settings.module')
          .then(m => m.default)
      }
    ]
  },
  
  // Wildcard (catch-all for 404)
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
```

---

## 🎨 STYLING STRATEGY

### Global Styles (styles.scss)
```scss
// CSS Reset
// Material Theme
// Global Variables
// Utility Classes
// Responsive Breakpoints
```

### Component Styles (component.scss)
```scss
// Component-scoped styles
// Uses ::ng-deep for Material overrides if needed
// Follows BEM naming for clarity
// Mobile-first responsive design
```

### Responsive Breakpoints
```scss
$breakpoints: (
  'xs': 0px,      // Mobile
  'sm': 600px,    // Tablet
  'md': 960px,    // Small desktop
  'lg': 1264px,   // Large desktop
  'xl': 1904px    // Extra large
);

// Usage in component
@media (max-width: 600px) {
  // Mobile styles
}
```

---

## 📦 DEPENDENCY INJECTION

### Core Module Providers (app.config.ts)
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    // Router
    provideRouter(routes),
    
    // HTTP Client with interceptors
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    
    // Animations
    provideAnimations()
  ]
};
```

### Service Providers
```typescript
// Provided in services/
// Used via constructor injection
// Singleton scope (default)

constructor(private authService: AuthService) { }
```

---

## 🌐 ENVIRONMENT CONFIGURATION

### Development Environment
```typescript
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### Production Environment
```typescript
// src/environments/environment.ts
export const environment = {
  production: true,
  apiUrl: 'https://d3dpmdc1qjwvnh.cloudfront.net/api'
};
```

### Usage in Service
```typescript
constructor() {
  this.apiUrl = environment.apiUrl + '/products';
}
```

---

## ✅ FORM HANDLING

### Reactive Forms Pattern
```typescript
export class ProductCreateComponent {
  form: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      gstPercent: ['', Validators.required]
    });
  }
  
  onSubmit() {
    if (this.form.valid) {
      this.productService.createProduct(this.form.value)
        .subscribe(result => {
          // Handle success
        });
    }
  }
}
```

### Template Binding
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="name" placeholder="Product Name">
  
  @if (form.get('name')?.hasError('required')) {
    <span class="error">Name is required</span>
  }
  
  <button type="submit" [disabled]="form.invalid">
    Create Product
  </button>
</form>
```

---

## 🔄 REQUEST/RESPONSE HANDLING

### API Response Pattern
```typescript
// Success Response
{
  token: "...",
  email: "...",
  fullName: "...",
  role: "...",
  permissions: [...]
}

// Error Response
{
  statusCode: 400,
  message: "Invalid email or password",
  errors: {
    email: ["Email not found"],
    password: ["Password incorrect"]
  }
}
```

### HTTP Interceptor Flow
```
Request:
1. authInterceptor runs
2. Adds Authorization header with JWT token
3. Request sent to API

Response:
1. HTTP response interceptor checks status
2. If 401: Clear localStorage, redirect to /auth/login
3. If 200-299: Pass response to component
4. If 4xx/5xx: Pass error to component error handler
```

---

## 🎬 LIFECYCLE HOOKS

### Component Lifecycle
```typescript
export class ProductListComponent implements OnInit, OnDestroy {
  products = signal<Product[]>([]);
  loading = signal(false);
  
  constructor(
    private productService: ProductService,
    private router: Router
  ) { }
  
  ngOnInit() {
    // Called when component initializes
    this.loadProducts();
  }
  
  ngOnDestroy() {
    // Called when component is destroyed
    // Cleanup subscriptions if needed
  }
  
  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.error(err),
      complete: () => this.loading.set(false)
    });
  }
}
```

---

## 📱 RESPONSIVE DESIGN

### Mobile-First Approach
```html
<!-- Desktop-only navigation -->
<nav class="sidebar">
  <!-- Full menu -->
</nav>

<!-- Mobile hamburger -->
<button class="hamburger" (click)="toggleSidebar()">
  ☰
</button>

<!-- Responsive sidebar -->
<div class="sidebar" [class.open]="isSidebarOpen()">
  <!-- Navigation items -->
</div>
```

### SCSS Media Queries
```scss
// Default: Mobile
.product-card {
  width: 100%;
  padding: 16px;
}

// Tablet and above
@media (min-width: 768px) {
  .product-card {
    width: 50%;
  }
}

// Desktop and above
@media (min-width: 1024px) {
  .product-card {
    width: 33.33%;
  }
}
```

---

## 🔍 DATA BINDING

### Two-Way Binding (Form Controls)
```html
<input [(ngModel)]="productName" />
<!-- Updates productName signal on input -->
<!-- Updates input value when productName changes -->
```

### One-Way Property Binding
```html
<app-sidebar [isOpen]="sidebarOpen()" />
<!-- Passes sidebarOpen signal value to component -->
```

### One-Way Event Binding
```html
<button (click)="deleteSidebar()">
  Delete
</button>
<!-- Calls deleteSidebar() on click -->
```

### String Interpolation
```html
<h1>{{ companyName() }}</h1>
<!-- Displays current companyName signal value -->
```

---

## 🧪 TESTING

### Unit Test Pattern
```typescript
describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should fetch products', () => {
    const mockProducts: Product[] = [/* ... */];
    
    service.getProducts().subscribe(products => {
      expect(products).toEqual(mockProducts);
    });
    
    const req = httpMock.expectOne('/api/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
});
```

---

## 📦 DEPENDENCIES

### Core Dependencies
```json
{
  "@angular/core": "^21.1.0",
  "@angular/common": "^21.1.0",
  "@angular/router": "^21.1.0",
  "@angular/forms": "^21.1.0",
  "@angular/platform-browser": "^21.1.0",
  "@angular/platform-browser-dynamic": "^21.1.0",
  "@angular/animations": "^21.2.8",
  "@angular/material": "^21.2.6",
  "@angular/cdk": "^21.2.6",
  "rxjs": "~7.8.0",
  "tslib": "^2.3.0"
}
```

### Dev Dependencies
```json
{
  "@angular/cli": "^21.1.0",
  "@angular/compiler-cli": "^21.1.0",
  "@angular-devkit/build-angular": "^21.1.0",
  "typescript": "~5.9.2",
  "vitest": "^4.0.8",
  "jsdom": "^27.1.0"
}
```

---

## 🚀 BUILD & DEPLOYMENT

### Build Configuration (angular.json)
```json
{
  "projects": {
    "taxaccount-frontend": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "browser": "src/main.ts",
            "outputPath": "dist/",
            "inlineStyleLanguage": "scss",
            "assets": ["public/**/*"],
            "styles": ["src/styles.scss"]
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kB",
                  "maximumError": "1MB"
                }
              ],
              "outputHashing": "all"
            }
          }
        }
      }
    }
  }
}
```

### Build Commands
```bash
# Development build (unoptimized)
npm run build

# Production build (optimized, tree-shaking)
ng build --configuration production

# Watch mode (rebuild on file changes)
npm run watch

# Development server
npm start  # http://localhost:4200
```

### Deployment to S3 + CloudFront
```bash
# Build production bundle
ng build --configuration production

# Upload to S3
aws s3 sync dist/ s3://taxaccount-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234ABCD \
  --paths "/*"
```

---

## 🔄 CI/CD PIPELINE

### GitHub Actions Workflow (.github/workflows/deploy-frontend.yml)
```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build production
        run: ng build --configuration production
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1
      
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://taxaccount-frontend --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id E1234ABCD \
            --paths "/*"
```

---

## ✅ BEST PRACTICES

### 1. Component Patterns
- ✅ Use **standalone: true** for all new components
- ✅ Use **Signals** instead of variables for state
- ✅ Use **@if/@for** instead of *ngIf/**ngFor
- ✅ Lazy-load feature modules with loadChildren
- ✅ Keep components focused (single responsibility)
- ✅ Extract reusable logic to services
- ✅ Use proper TypeScript typing (no `any`)

### 2. Service Patterns
- ✅ Use **interface prefix** (IProductService)
- ✅ Create services in `/core/services/`
- ✅ Return **Observables** from HTTP methods
- ✅ Handle errors in components (not services)
- ✅ Use **dependency injection** for services
- ✅ Keep API logic separate from business logic
- ✅ Cache data where appropriate

### 3. Form Patterns
- ✅ Use **Reactive Forms** (not Template Forms)
- ✅ Create **FormGroup** in component class
- ✅ Validate on **blur** and **submit** events
- ✅ Show **validation errors** in templates
- ✅ Disable submit button when **form.invalid**
- ✅ Use **Validators** for common patterns
- ✅ Create **custom validators** for complex rules

### 4. Template Patterns
- ✅ Use **@if/@for** control flow
- ✅ Use **track function** in @for loops
- ✅ Bind to **signals** directly (no async pipe)
- ✅ Use **[property]** for property binding
- ✅ Use **(event)** for event binding
- ✅ Use **[class.active]** for conditional CSS
- ✅ Use **[ngStyle]** for conditional inline styles

### 5. Styling Patterns
- ✅ Use **SCSS** for all stylesheets
- ✅ Define **variables** in main styles.scss
- ✅ Use **nested selectors** for clarity
- ✅ Follow **BEM naming** convention
- ✅ Use **mobile-first** responsive design
- ✅ Avoid **deep selectors** (::ng-deep)
- ✅ Use **CSS Grid** and **Flexbox** layouts

### 6. HTTP Patterns
- ✅ Use **HttpClient** from @angular/common/http
- ✅ Add **interceptors** for auth/error handling
- ✅ Return **Observable** from service methods
- ✅ Handle **errors** in components
- ✅ Use **loading states** during requests
- ✅ Cancel requests on **component destroy**
- ✅ Type all **HTTP responses** with interfaces

### 7. Naming Conventions
- ✅ **Components**: PascalCase (ProductListComponent)
- ✅ **Services**: PascalCase (ProductService)
- ✅ **Files**: kebab-case (product-list.ts)
- ✅ **CSS Classes**: kebab-case (.product-list)
- ✅ **Signals**: camelCase (productList)
- ✅ **Methods**: camelCase (getProduct())
- ✅ **Constants**: UPPER_SNAKE_CASE (API_URL)

### 8. Performance
- ✅ Lazy-load routes and modules
- ✅ Use **OnPush** change detection
- ✅ Unsubscribe from **Observables**
- ✅ Use **trackBy** in *ngFor loops
- ✅ Defer non-critical components
- ✅ Use **Signals** for small state (smaller bundles)
- ✅ Minimize **HTTP requests** with caching

### 9. Security
- ✅ Never store **sensitive data** in localStorage (except token)
- ✅ Use **HTTPS** in production
- ✅ Validate inputs **server-side** always
- ✅ Sanitize **user input** with Angular's sanitizer
- ✅ Use **Content Security Policy** headers
- ✅ Keep **dependencies updated**
- ✅ Use **secure HTTP headers** (X-Content-Type-Options, etc.)

### 10. Code Organization
- ✅ One component per file
- ✅ One service per file
- ✅ Group related features in folders
- ✅ Use barrel exports (index.ts)
- ✅ Keep imports alphabetical
- ✅ Add TypeScript comments for clarity
- ✅ Use ESLint for code consistency

---

## 📝 CODE EXAMPLES

### Example: ProductListComponent
```typescript
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ProductService } from '@core/services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="product-list">
      <h2>Products</h2>
      
      <button mat-raised-button (click)="navigateToCreate()">
        Add Product
      </button>
      
      @if (loading()) {
        <p>Loading products...</p>
      } @else if (products().length === 0) {
        <p>No products found</p>
      } @else {
        <div class="product-grid">
          @for (product of products(); track product.id) {
            <div class="product-card">
              <h3>{{ product.name }}</h3>
              <p>Price: {{ product.price | currency }}</p>
              <p>Stock: {{ product.stock }}</p>
              <button (click)="editProduct(product.id)">Edit</button>
              <button (click)="deleteProduct(product.id)">Delete</button>
            </div>
          }
        </div>
      }
      
      @if (error()) {
        <div class="error-message">
          {{ error() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .product-list {
      padding: 20px;
    }
    
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .product-card {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .error-message {
      color: #d32f2f;
      padding: 12px;
      background-color: #ffebee;
      border-radius: 4px;
      margin-top: 16px;
    }
  `]
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  constructor(
    private productService: ProductService,
    private router: Router
  ) { }
  
  ngOnInit() {
    this.loadProducts();
  }
  
  loadProducts() {
    this.loading.set(true);
    this.error.set(null);
    
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load products');
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }
  
  navigateToCreate() {
    this.router.navigate(['/products/create']);
  }
  
  editProduct(id: number) {
    this.router.navigate(['/products/edit', id]);
  }
  
  deleteProduct(id: number) {
    if (confirm('Are you sure?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products.update(p => p.filter(x => x.id !== id));
        },
        error: (err) => {
          this.error.set('Failed to delete product');
        }
      });
    }
  }
}
```

---

## ⚠️ COMMON PITFALLS TO AVOID

1. **Don't** use `*ngIf` / `*ngFor` → Use `@if` / `@for`
2. **Don't** forget `track` function in `@for` loops
3. **Don't** store sensitive data in localStorage
4. **Don't** forget to unsubscribe from Observables
5. **Don't** use `any` type - always define interfaces
6. **Don't** hardcode API URLs - use environment files
7. **Don't** put all logic in components - extract to services
8. **Don't** use string literals for route paths - use RouterLinks
9. **Don't** forget to add `standalone: true` to new components
10. **Don't** ignore TypeScript strict mode errors

---

## 🔗 INTEGRATION WITH BACKEND

### API Endpoints Used
```
Authentication
POST   /api/auth/register
POST   /api/auth/login

Products
GET    /api/products
POST   /api/products
GET    /api/products/{id}
PUT    /api/products/{id}
DELETE /api/products/{id}

Contacts
GET    /api/contacts
POST   /api/contacts
...

Invoices
GET    /api/invoice
POST   /api/invoice
...

And many more...
```

### Token Handling
```
1. Login returns JWT token
2. AuthService stores in localStorage
3. AuthInterceptor adds to every request header
4. Backend validates token
5. If invalid: Response 401 → Clear localStorage → Redirect to login
6. If valid: Request proceeds normally
```

---

## 📱 MOBILE RESPONSIVENESS

### Breakpoints Used
```scss
// Mobile: 0 - 599px
// Tablet: 600px - 959px
// Desktop: 960px+
```

### Mobile Features
- ✅ Hamburger menu sidebar (toggles on mobile)
- ✅ Single column layouts on mobile
- ✅ Larger touch targets (48px minimum)
- ✅ Full-width modals on mobile
- ✅ Bottom navigation option (can add)

---

## 🎯 FUTURE ENHANCEMENTS

### Planned Features
- 📱 Progressive Web App (PWA) support
- 🔔 Push notifications
- 📊 Advanced charting library (Chart.js)
- 🌍 i18n (Internationalization)
- 🎨 Dark mode theme
- 🔐 Two-factor authentication (2FA)
- 📄 PDF export functionality
- 📧 Email notifications
- 🗺️ Advanced data visualization
- 🔌 Third-party integrations (payment gateways, etc.)

---

## 📚 LEARNING RESOURCES

### Official Documentation
- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SCSS Documentation](https://sass-lang.com/documentation)
- [RxJS Operators](https://rxjs.dev/guide/operators)

### Angular 21 New Features
- Standalone Components (stable)
- Angular Signals (stable)
- New Control Flow Syntax (@if, @for, @switch)
- Improved Change Detection
- Built-in Angular CLI (v21)

---

## 🤝 CONTRIBUTING

### Development Workflow
```bash
# Clone repository
git clone https://github.com/codegovind/TaxAccount-Frontend.git
cd TaxAccount-Frontend

# Install dependencies
npm install

# Start development server
npm start

# Create feature branch
git checkout -b feature/feature-name

# Make changes and test
npm test

# Commit and push
git add .
git commit -m "feat: add feature description"
git push origin feature/feature-name

# Create Pull Request on GitHub
```

---

## 📞 SUPPORT & CONTACT

**Developer**: Govind R. Tekale  
**Email**: govindsuryawanshi001@gmail.com  
**GitHub**: https://github.com/codegovind  
**Location**: Pune/Latur, Maharashtra, India

---

## 📄 PROJECT INFORMATION

**Repository**: [TaxAccount-Frontend](https://github.com/codegovind/TaxAccount-Frontend)  
**License**: MIT  
**Status**: Active Development (v0.1)  
**Last Updated**: 1 June 2026

---

**For Backend Documentation**: See [claude.md in TaxAccount-API](https://github.com/codegovind/TaxAccount-API/blob/main/claude.md)

