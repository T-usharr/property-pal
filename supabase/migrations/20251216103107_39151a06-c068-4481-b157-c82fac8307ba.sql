-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  builder_name TEXT DEFAULT '',
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tags TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  checklist JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Users can only view their own properties
CREATE POLICY "Users can view their own properties"
ON public.properties FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own properties
CREATE POLICY "Users can create their own properties"
ON public.properties FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own properties
CREATE POLICY "Users can update their own properties"
ON public.properties FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own properties
CREATE POLICY "Users can delete their own properties"
ON public.properties FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();