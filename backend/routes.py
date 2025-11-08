from flask import Blueprint, jsonify, request
import pandas as pd
from .utils import load_data

api_bp = Blueprint('api', __name__)

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200

@api_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get summary statistics"""
    df = load_data()
    
    if df.empty:
        return jsonify({'error': 'No data available'}), 500
    
    # Calculate statistics
    unique_patients = df['subject_id'].nunique()
    treatment_arms = df['arm'].dropna().unique().tolist()
    dose_levels = sorted(df['dose'].dropna().unique().tolist())
    
    return jsonify({
        'unique_patients': int(unique_patients),
        'treatment_arms': treatment_arms,
        'dose_levels': dose_levels,
    }), 200

@api_bp.route('/spider', methods=['GET'])
def get_spider_data():
    """Get spider plot data with optional filtering"""
    df = load_data()
    
    if df.empty:
        return jsonify({'error': 'No data available'}), 500
    
    # Get query parameters
    arms_param = request.args.get('arms', '')
    doses_param = request.args.get('doses', '')
    tumor_types_param = request.args.get('tumor_types', '')
    
    # Apply filters if provided
    if arms_param:
        arms_list = [arm.strip() for arm in arms_param.split(',')]
        df = df[df['arm'].isin(arms_list)]
    
    if doses_param:
        doses_list = [float(dose.strip()) for dose in doses_param.split(',')]
        df = df[df['dose'].isin(doses_list)]
    
    if tumor_types_param:
        tumor_types_list = [tt.strip() for tt in tumor_types_param.split(',')]
        df = df[df['tumor_type'].isin(tumor_types_list)]
    
    # Sort by subject_id and days to ensure proper ordering
    df = df.sort_values(['subject_id', 'days'])
    
    # Convert to list of dictionaries with required fields
    # Filter out rows with NaN subject_id
    result = []
    for _, row in df.iterrows():
        # Skip rows where subject_id is NaN
        if pd.isna(row['subject_id']):
            continue
            
        subject_id = str(row['subject_id'])
        # Skip if subject_id is the string 'nan'
        if subject_id.lower() == 'nan':
            continue
            
        result.append({
            'subject_id': subject_id,
            'arm': str(row['arm']) if pd.notna(row['arm']) else None,
            'dose': float(row['dose']) if pd.notna(row['dose']) else None,
            'tumor_type': str(row['tumor_type']) if pd.notna(row['tumor_type']) else None,
            'change': float(row['change']) if pd.notna(row['change']) else None,
            'days': int(row['days']) if pd.notna(row['days']) else None
        })
    
    return jsonify(result), 200

