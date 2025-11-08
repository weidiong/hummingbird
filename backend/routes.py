from flask import Blueprint, jsonify
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
        'total_records': int(len(df))
    }), 200

@api_bp.route('/data', methods=['GET'])
def get_data():
    """Get all data"""
    df = load_data()
    
    if df.empty:
        return jsonify({'error': 'No data available'}), 500
    
    # Convert DataFrame to JSON
    return jsonify(df.to_dict('records')), 200

