# SchemaStudio

**A schema-driven admin console for building dynamic forms and data management interfaces.**

SchemaStudio allows you to design forms with advanced visibility and computed logic, preview them with validation, and explore data in a high-performance virtualized grid with inline editing capabilities.

## ✨ Features

### 🎨 Form Designer
- **Intuitive Interface**: Drag & drop from Palette → Canvas → Inspector
- **Live Preview**: Real-time form rendering with Zod validation
- **Smart Fields**: Computed read-only fields with live values JSON
- **Conditional Logic**: Dynamic field visibility based on form state

### 📊 Data Grid
- **High Performance**: Virtualized rendering for 10,000+ rows
- **Inline Editing**: Direct cell editing with validation
- **URL State Sync**: Shareable links with sort/filter/pagination state
- **Advanced Filtering**: Multi-column filtering with type-specific controls

### 🎯 User Experience
- **Dark Mode**: Class-based Tailwind implementation with persistence
- **Responsive Design**: Mobile-first with adaptive layouts
- **Accessibility**: Full keyboard navigation and ARIA support
- **Persistence**: Schema and history automatically saved

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js (App Router) + TypeScript |
| **State Management** | Zustand with persist middleware |
| **Drag & Drop** | @dnd-kit |
| **Validation** | Zod runtime validation |
| **Data Grid** | @tanstack/react-table + @tanstack/react-virtual |
| **Styling** | Tailwind CSS |
| **Testing** | Jest + React Testing Library, Cypress E2E |

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── designer/             # Form designer interface
│   ├── grid/                 # Data grid interface
│   └── layout.tsx            # Theme provider & app shell
├── modules/
│   ├── designer/
│   │   ├── components/       # Canvas, Palette, Inspector, Toolbar
│   │   ├── store.ts          # Zustand store (persisted)
│   │   └── factories.ts      # Field creation utilities
│   ├── preview/
│   │   └── FormRenderer.tsx  # Live form preview component
│   ├── grid/
│   │   └── DataGrid.tsx      # Virtualized data grid
│   └── theme/
│       ├── ThemeProvider.tsx # Dark/light mode management
│       └── ThemeToggle.tsx   # Theme switching component
└── public/                   # Static assets
```

## 🏗 Architecture

### State Management Strategy

#### 🔄 **Designer State** (Persisted via Zustand)
- **Schema**: Field definitions with validation, visibility, and computed logic
- **History**: Undo/redo functionality with capped stacks
- **UI State**: Selected field, clipboard operations
- **Persistence**: Automatically saved to localStorage

#### ⚡ **Preview Values** (Ephemeral)
- Managed within FormRenderer component
- Runtime form data and validation states
- Not persisted by default (can be extended if needed)

#### 🔗 **Grid State** (URL-Backed)
- Query parameters: `?sortBy=`, `?sortDir=`, `?page=`, `?fName=`, etc.
- **Benefits**: Shareable URLs, browser navigation, deep linking
- Applied server-side before data slicing for optimal performance

### 🎯 Drag & Drop Implementation

Built with `@dnd-kit` for robust touch and mouse support:

- **Palette to Canvas**: Creates new fields with type definitions
- **Canvas Reordering**: Intuitive field arrangement within sections
- **Touch Optimized**: Distance activation prevents accidental drags
- **Accessibility**: Keyboard-friendly with proper ARIA labels

### 🔐 Validation & Dynamic Logic

#### **Zod Integration**
- Runtime schema generation from field definitions
- Type-safe validation with detailed error messages
- Support for complex validation rules (required, min/max, regex)

#### **Expression Engine**
- **Conditional Visibility**: `visibleWhen` expressions for dynamic forms
- **Computed Fields**: JavaScript expressions for calculated values
- **Security**: Sandboxed evaluation against whitelisted values only

## ⚡ Performance Optimizations

### 🚀 **Virtualization**
- Only renders visible grid rows using `@tanstack/react-virtual`
- Handles datasets with 10,000+ records smoothly
- Automatic scrolling and focus management

### 🎯 **Smart State Management**
- URL-level filtering/sorting before component rendering
- Selective persistence via Zustand `partialize`
- Memoized column definitions and computed values

### 📱 **Mobile Optimizations**
- Throttled drag events to reduce pointer churn
- Distance-based activation for better touch experience
- Optimized bundle size with Next.js package optimization

## ♿ Accessibility Features

### 📝 **Form Accessibility**
- Inline error messages with `aria-describedby`
- Alert regions with `role="alert"` for screen readers
- Disabled state for computed fields to prevent confusion

### 📊 **Grid Accessibility**
- Full ARIA grid implementation (`role="grid"`, `role="row"`, `role="gridcell"`)
- Keyboard navigation: arrow keys, Enter to edit, Escape to cancel
- Auto-scroll to maintain focus visibility
- High-contrast mode support

### 🎨 **Visual Accessibility**
- High-contrast variants for dark mode
- Large touch targets for mobile interactions
- Focus indicators and keyboard navigation patterns

## 📱 Responsive Design

### 🖥 **Desktop Experience**
- Three-pane layout: Palette | Canvas | Inspector
- Balanced column widths with resizable panels
- Full keyboard shortcuts and power-user features

### 📱 **Mobile Experience**
- Tabbed interface for space efficiency
- Horizontal scroll for wide data grids
- Touch-optimized drag handles and controls
- Adaptive typography and spacing

### 🌈 **Theming System**
- **Implementation**: Tailwind `darkMode: "class"`
- **Persistence**: localStorage with system preference detection
- **Smooth Transitions**: Class-based switching on `<html>` element
- **Default Behavior**: Respects `prefers-color-scheme` on first visit

### **Deployment**

- used vercel to deploy the main code is in main branch
- github repo URL: https://github.com/vikasreddynomula/schemastudio/
- Deployed App URL: https://schemastudio.vercel.app/


## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
